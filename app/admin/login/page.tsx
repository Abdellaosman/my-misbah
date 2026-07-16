import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { adminLogin } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Admin Sign In — My Misbah",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <LoginForm
      action={adminLogin}
      next={next}
      heading="Admin Sign In"
      subheading="Sign in to manage the My Misbah platform."
    />
  );
}
