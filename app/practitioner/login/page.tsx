import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { practitionerLogin } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Practitioner Sign In — My Misbah",
};

export default async function PractitionerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <LoginForm
      action={practitionerLogin}
      next={next}
      heading="Practitioner Sign In"
      subheading="Sign in to manage your appointments, availability, and services."
    />
  );
}
