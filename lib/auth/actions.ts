"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroyCurrentSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordAuditLog } from "@/lib/audit/log";
import type { UserRole } from "@/generated/prisma/client";

export interface LoginFormState {
  error?: string;
}

async function login(
  portalRole: UserRole,
  homePath: string,
  loginPath: string,
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const headerList = await headers();
  const ip = getClientIp(headerList);
  const userAgent = headerList.get("user-agent");

  const rateLimit = await checkRateLimit({
    action: "login",
    identifier: ip,
    limit: 10,
    windowSeconds: 15 * 60,
  });
  if (!rateLimit.allowed) {
    return { error: "Too many login attempts. Please try again in a few minutes." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately generic error message + constant-ish work path so we don't
  // leak whether an email exists or which check failed.
  const genericError = "Invalid email or password.";
  if (!user || user.role !== portalRole || user.deletedAt) {
    await recordAuditLog({
      action: "auth.login_failed",
      metadata: { reason: "no_matching_active_account" },
      ipAddress: ip,
      userAgent,
    });
    return { error: genericError };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    await recordAuditLog({
      actorUserId: user.id,
      actorRole: user.role,
      action: "auth.login_failed",
      metadata: { reason: "bad_password" },
      ipAddress: ip,
      userAgent,
    });
    return { error: genericError };
  }

  if (user.status !== "ACTIVE") {
    await recordAuditLog({
      actorUserId: user.id,
      actorRole: user.role,
      action: "auth.login_blocked",
      metadata: { status: user.status },
      ipAddress: ip,
      userAgent,
    });
    return {
      error:
        user.status === "PENDING_APPROVAL"
          ? "Your account is awaiting admin approval."
          : "Your account has been suspended. Contact support for help.",
    };
  }

  await createSession({ userId: user.id, ipAddress: ip, userAgent });
  await recordAuditLog({
    actorUserId: user.id,
    actorRole: user.role,
    action: "auth.login_succeeded",
    ipAddress: ip,
    userAgent,
  });

  const next = formData.get("next");
  const safeNext =
    typeof next === "string" && next.startsWith(homePath) ? next : homePath;
  redirect(safeNext || homePath);
}

export async function practitionerLogin(prevState: LoginFormState, formData: FormData) {
  return login("PRACTITIONER", "/practitioner/dashboard", "/practitioner/login", prevState, formData);
}

export async function adminLogin(prevState: LoginFormState, formData: FormData) {
  return login("ADMIN", "/admin/dashboard", "/admin/login", prevState, formData);
}

export async function logout(homePath: string) {
  await destroyCurrentSession();
  redirect(homePath);
}
