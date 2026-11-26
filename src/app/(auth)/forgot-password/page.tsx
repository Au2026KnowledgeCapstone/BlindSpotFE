
"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/features/auth";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold">
          Forgot Password?
        </h1>

        {success ? (
          <p role="status" className="text-green-600">
            If this address is eligible for password reset, check your email for a link.
            Open it in this browser.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-500">
              Enter your email address to receive
              a password reset link.
            </p>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-md border p-3"
            />

            {error && (
              <p role="alert" className="text-red-500">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <Link href="/login" className="text-sm underline">
          Back to Login
        </Link>
      </div>
    </main>
  );
}
