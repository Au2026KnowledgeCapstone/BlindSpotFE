"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth-service";
import { AuthRequestError } from "@/features/auth/services/backend-auth";
import { FIELD } from "@/shared/ui/field";

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAccepted(false);
    setSubmitting(true);
    try {
      await authService.resendConfirmation(email.trim());
      setAccepted(true);
    } catch (error) {
      setError(error instanceof AuthRequestError ? error.message : "Unable to request confirmation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-semibold text-fg">Resend confirmation email</h2>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="confirmation-email" className="text-sm font-medium">Email address</label>
          <input
            id="confirmation-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`${FIELD} h-11 rounded-full px-4`}
          />
        </div>
        <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Requesting link..." : "Resend confirmation email"}
        </Button>
        {error && <p role="alert" className="text-sm text-fail">{error}</p>}
        {accepted && (
          <p role="status" className="text-sm text-pass">
            If confirmation is still needed, check your email for a link. Open it in this browser.
          </p>
        )}
      </form>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-accent">
        <Link href="/login" className="hover:underline">Sign in</Link>
        <Link href="/forgot-password" className="hover:underline">Forgot password?</Link>
      </div>
    </div>
  );
}
