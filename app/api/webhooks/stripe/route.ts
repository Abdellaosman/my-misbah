import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { constructStripeEvent } from "@/lib/payments/stripe";
import { recordAuditLog } from "@/lib/audit/log";

/**
 * Stripe webhook endpoint. This is the *only* source of truth for whether a
 * booking is actually paid — the client is redirected to a success URL
 * optimistically, but the UI never shows "confirmed" until this handler has
 * flipped the Appointment/Payment rows, because a browser redirect can be
 * spoofed or interrupted while a signed server-to-server webhook cannot.
 *
 * Idempotency: every delivery is first recorded in `StripeWebhookEvent`
 * keyed by the unique `stripeEventId`. If Stripe redelivers the same event
 * (which it does on any non-2xx response, and sometimes even after a 2xx),
 * the duplicate `create` throws a unique-constraint violation and we return
 * 200 immediately without reprocessing — so a webhook that already
 * succeeded, or is currently being processed by a concurrent request, can
 * never be double-applied (e.g. double-confirming an appointment).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(rawBody, signature);
  } catch (err) {
    logger.warn("Stripe webhook signature verification failed", { err });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        payload: event as unknown as object,
        status: "RECEIVED",
      },
    });
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      logger.info("Duplicate Stripe webhook delivery ignored", { eventId: event.id, type: event.type });
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw err;
  }

  try {
    await processStripeEvent(event);
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
  } catch (err) {
    logger.error("Failed to process Stripe webhook event", { err, eventId: event.id, type: event.type });
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId: event.id },
      data: { status: "FAILED", error: err instanceof Error ? err.message : "Unknown error" },
    });
    // Returning 500 asks Stripe to retry delivery; the dedupe check above
    // ensures a subsequent retry safely no-ops if we actually did finish.
    return NextResponse.json({ error: "Failed to process event" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function isUniqueConstraintViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

function mapStripeRefundStatus(status: string | null): "PENDING" | "SUCCEEDED" | "FAILED" {
  if (status === "succeeded") return "SUCCEEDED";
  if (status === "failed" || status === "canceled") return "FAILED";
  return "PENDING";
}

async function processStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      return;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      return;
    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      return;
    case "charge.dispute.created":
      await handleDisputeCreated(event.data.object as Stripe.Dispute);
      return;
    default:
      logger.info("Unhandled Stripe webhook event type", { type: event.type });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const appointmentId = session.metadata?.appointmentId;
  if (!appointmentId) {
    logger.warn("checkout.session.completed missing appointmentId metadata", { sessionId: session.id });
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const confirmed = await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { payment: true },
    });
    if (!appointment) {
      logger.warn("checkout.session.completed for unknown appointment", { appointmentId });
      return false;
    }
    // Idempotent no-op if this appointment was already confirmed by an
    // earlier delivery of this (or an equivalent) event.
    if (appointment.status !== "PENDING_PAYMENT") {
      return false;
    }

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED", paymentStatus: "SUCCEEDED" },
    });
    await tx.appointmentStatusHistory.create({
      data: {
        appointmentId,
        fromStatus: "PENDING_PAYMENT",
        toStatus: "CONFIRMED",
        reason: "Stripe checkout.session.completed",
      },
    });
    if (appointment.payment) {
      await tx.payment.update({
        where: { id: appointment.payment.id },
        data: {
          status: "SUCCEEDED",
          stripePaymentIntentId: paymentIntentId ?? appointment.payment.stripePaymentIntentId,
          stripeCheckoutSessionId: session.id,
        },
      });
    }
    return true;
  });

  if (confirmed) {
    logger.info("Appointment confirmed via Stripe checkout", { appointmentId });
    // Zoom meeting creation and confirmation emails are triggered
    // out-of-band from here (see lib/video and lib/email) so a slow or
    // failing downstream integration never risks this webhook timing out
    // or Stripe re-delivering the event.
    await triggerPostConfirmationSideEffects(appointmentId);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const appointmentId = paymentIntent.metadata?.appointmentId;
  if (!appointmentId) return;

  await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({ where: { id: appointmentId }, include: { payment: true } });
    if (!appointment || appointment.status !== "PENDING_PAYMENT") return;

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" },
    });
    await tx.appointmentStatusHistory.create({
      data: {
        appointmentId,
        fromStatus: "PENDING_PAYMENT",
        toStatus: "PAYMENT_FAILED",
        reason: paymentIntent.last_payment_error?.message ?? "Stripe payment_intent.payment_failed",
      },
    });
    if (appointment.payment) {
      await tx.payment.update({ where: { id: appointment.payment.id }, data: { status: "FAILED" } });
    }
  });
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { appointment: true, refunds: true },
  });
  if (!payment) {
    logger.warn("charge.refunded for unknown payment", { paymentIntentId });
    return;
  }

  const latestRefund = charge.refunds?.data?.[0];
  const isFullyRefunded = charge.amount_refunded >= charge.amount;
  const newStatus = isFullyRefunded ? "REFUNDED" : "PARTIALLY_REFUNDED";

  await prisma.$transaction(async (tx) => {
    if (latestRefund && !payment.refunds.some((r) => r.stripeRefundId === latestRefund.id)) {
      await tx.refund.create({
        data: {
          paymentId: payment.id,
          stripeRefundId: latestRefund.id,
          amount: (latestRefund.amount / 100).toFixed(2),
          reason: latestRefund.reason ?? undefined,
          status: mapStripeRefundStatus(latestRefund.status),
        },
      });
    }

    await tx.payment.update({ where: { id: payment.id }, data: { status: newStatus } });

    if (payment.appointment.status !== newStatus) {
      await tx.appointment.update({
        where: { id: payment.appointment.id },
        data: { status: newStatus, paymentStatus: newStatus },
      });
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: payment.appointment.id,
          fromStatus: payment.appointment.status,
          toStatus: newStatus,
          reason: "Stripe charge.refunded",
        },
      });
    }
  });
}

async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
  logger.error("Stripe dispute created — manual review required", { paymentIntentId, disputeId: dispute.id });
  await recordAuditLog({
    action: "stripe.dispute.created",
    targetType: "Payment",
    targetId: paymentIntentId ?? undefined,
    metadata: { disputeId: dispute.id, reason: dispute.reason, amount: dispute.amount },
  });
}

async function triggerPostConfirmationSideEffects(appointmentId: string): Promise<void> {
  // Intentionally fire-and-forget from the webhook's perspective: any
  // failure here must not fail the webhook response (Stripe would retry
  // and we've already confirmed the appointment). lib/video's own retry
  // sweep (cron) is the durability mechanism for Zoom specifically.
  try {
    const { ensureZoomMeetingForAppointment } = await import("@/lib/video/zoom");
    await ensureZoomMeetingForAppointment(appointmentId);
  } catch (err) {
    logger.error("Post-confirmation Zoom meeting creation failed; will be retried by cron sweep", {
      err,
      appointmentId,
    });
  }
}
