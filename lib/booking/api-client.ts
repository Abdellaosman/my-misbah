"use client";

/** Thin fetch wrapper matching the `{ error: { code, message } }` shape from `lib/http/errors.ts`. */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // no body
  }

  if (!response.ok) {
    const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiClientError(
      err?.message ?? "Something went wrong. Please try again.",
      err?.code ?? "unknown_error",
      response.status,
    );
  }

  return body as T;
}
