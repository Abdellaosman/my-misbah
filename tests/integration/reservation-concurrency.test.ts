import { randomUUID } from "crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { POST as reserve } from "@/app/api/public/bookings/reserve/route";
import {
  createTestPractitionerWithService,
  cleanupPractitionerFixture,
  type TestPractitionerFixture,
} from "./helpers";

/** Builds a POST request to the reserve endpoint with a unique IP so the
 * Postgres-backed rate limiter never interferes between assertions. */
function buildReserveRequest(serviceId: string, startAtIso: string) {
  return new Request("http://localhost/api/public/bookings/reserve", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": randomUUID(),
    },
    body: JSON.stringify({ serviceId, startAt: startAtIso }),
  });
}

describe("Booking reservation concurrency", () => {
  let fixture: TestPractitionerFixture;

  beforeAll(async () => {
    fixture = await createTestPractitionerWithService();
  });

  afterAll(async () => {
    await cleanupPractitionerFixture(fixture);
  });

  it("only lets one of two simultaneous requests for the identical slot succeed", async () => {
    // 3 days out, at a fixed UTC hour comfortably inside the fully-open
    // fixture schedule and past any notice/advance-window constraints.
    const startAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    startAt.setUTCHours(10, 0, 0, 0);
    const startAtIso = startAt.toISOString();

    const [responseA, responseB] = await Promise.all([
      reserve(buildReserveRequest(fixture.serviceId, startAtIso)),
      reserve(buildReserveRequest(fixture.serviceId, startAtIso)),
    ]);

    const statuses = [responseA.status, responseB.status].sort((a, b) => a - b);
    // One request wins with 201 Created; the other loses — either caught by
    // the app-level slot re-check or the Postgres EXCLUDE constraint itself
    // — and is surfaced as a 409 Conflict either way.
    expect(statuses).toEqual([201, 409]);

    const reservations = await prisma.bookingReservation.findMany({
      where: { practitionerId: fixture.practitionerId, startAt },
    });
    expect(reservations).toHaveLength(1);
    expect(reservations[0].status).toBe("HOLDING");
  });

  it("allows a new reservation for the same slot once the earlier one is cancelled", async () => {
    const startAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    startAt.setUTCHours(11, 0, 0, 0);
    const startAtIso = startAt.toISOString();

    const first = await reserve(buildReserveRequest(fixture.serviceId, startAtIso));
    expect(first.status).toBe(201);
    const firstBody = await first.json();

    await prisma.bookingReservation.update({
      where: { id: firstBody.reservationId },
      data: { status: "CANCELLED" },
    });

    const second = await reserve(buildReserveRequest(fixture.serviceId, startAtIso));
    expect(second.status).toBe(201);
  });
});

describe("BookingReservation exclusion constraint (DB-level safety net)", () => {
  let fixture: TestPractitionerFixture;

  beforeAll(async () => {
    fixture = await createTestPractitionerWithService({ withAvailability: false });
  });

  afterAll(async () => {
    await cleanupPractitionerFixture(fixture);
  });

  it("rejects two overlapping HOLDING reservations even when created directly, bypassing app-level checks", async () => {
    const startAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const createOne = () =>
      prisma.bookingReservation.create({
        data: {
          practitionerId: fixture.practitionerId,
          serviceId: fixture.serviceId,
          startAt,
          endAt,
          expiresAt,
        },
      });

    const results = await Promise.allSettled([createOne(), createOne()]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const reservations = await prisma.bookingReservation.findMany({
      where: { practitionerId: fixture.practitionerId },
    });
    expect(reservations).toHaveLength(1);
  });

  it("allows two non-overlapping reservations for the same practitioner", async () => {
    const startA = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    const endA = new Date(startA.getTime() + 60 * 60 * 1000);
    const startB = new Date(endA.getTime() + 60 * 60 * 1000);
    const endB = new Date(startB.getTime() + 60 * 60 * 1000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await expect(
      prisma.bookingReservation.create({
        data: { practitionerId: fixture.practitionerId, serviceId: fixture.serviceId, startAt: startA, endAt: endA, expiresAt },
      }),
    ).resolves.toBeDefined();

    await expect(
      prisma.bookingReservation.create({
        data: { practitionerId: fixture.practitionerId, serviceId: fixture.serviceId, startAt: startB, endAt: endB, expiresAt },
      }),
    ).resolves.toBeDefined();
  });
});
