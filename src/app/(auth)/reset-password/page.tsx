
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authService } from "@/features/auth";
import { FIELD } from "@/shared/ui/field";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authService.getRecoveryUser().then((user) => {
      if (!active) return;
      setAuthorized(Boolean(user));
      if (!user) setError("Invalid or expired reset link. Please request a new one.");
    }).catch(() => {
      if (active) setError("Unable to verify your session. Please reload to try again.");
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!authorized) {
      setError("Please open a valid password reset link.");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.updatePassword(password);
      setSuccessMessage(result.message);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-fg">
            Reset Password
          </h1>

          <p className="text-sm text-fg-secondary">
            Create a new password for your BlindSpot account.
          </p>
        </div>

        {checking ? (
          <p className="text-fg-secondary">
            Verifying your reset link...
          </p>
        ) : success ? (
          <div className="space-y-4">
            <p role="status" className="text-pass">
              {successMessage || "Your password has been updated successfully!"}
            </p>

            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : !authorized ? (
          <div className="space-y-4">
            <p role="alert" className="text-fail">
              {error}
            </p>

            <Link
              href="/forgot-password"
              className="font-medium text-accent hover:underline"
            >
              Request another reset link
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                New password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={FIELD}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
              >
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className={FIELD}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-fail">
                {error}
              </p>
            )}

            <Button type="submit" variant="outline" size="lg" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
