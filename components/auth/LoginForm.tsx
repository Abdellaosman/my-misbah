"use client";

import { useActionState } from "react";
import type { LoginFormState } from "@/lib/auth/actions";

interface LoginFormProps {
  action: (prevState: LoginFormState, formData: FormData) => Promise<LoginFormState>;
  next?: string;
  heading: string;
  subheading: string;
}

const initialState: LoginFormState = {};

export default function LoginForm({ action, next, heading, subheading }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F3] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm p-8">
          <h1 className="font-serif text-2xl text-[#1A2B50] font-bold mb-1">{heading}</h1>
          <p className="text-[#6b6878] text-sm mb-6">{subheading}</p>

          <form action={formAction} className="space-y-4" noValidate>
            {next ? <input type="hidden" name="next" value={next} /> : null}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A2B50] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-[#DDD5C4] px-3.5 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#C8680A]/40 focus:border-[#C8680A]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A2B50] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[#DDD5C4] px-3.5 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#C8680A]/40 focus:border-[#C8680A]"
              />
            </div>

            {state?.error ? (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="w-full text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)" }}
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-[#9895a2] mt-4">
          Having trouble signing in?{" "}
          <a href="mailto:support@mymisbah.example" className="text-[#C8680A] font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
