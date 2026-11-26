
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthRequestError, authService } from "@/features/auth";
import { FIELD } from "@/shared/ui/field";
import { Button } from "@/components/ui/button";
import { LoadingMark } from "@/shared/ui/LoadingMark";

const invalidLink = "Invalid or expired reset link. Please request a new one.";

function callbackError(outcome: string | null) {
  if (outcome === "expired") return "This reset link has expired. Please request a new one.";
  if (outcome === "invalid") return invalidLink;
  if (outcome === "failed") return "We could not complete this reset link. Please request a new one.";
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [recoveryUserId, setRecoveryUserId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [verificationUnavailable, setVerificationUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    const failure = callbackError(new URLSearchParams(window.location.search).get("recovery"));
    if (failure) {
      setError(failure);
      setChecking(false);
      return;
    }
    authService.getRecoveryUser().then((user) => {
      if (!active) return;
      setRecoveryUserId(user?.id ?? null);
      if (!user) setError(invalidLink);
    }).catch(() => {
      if (!active) return;
      setVerificationUnavailable(true);
      setError("Unable to verify your reset link. Please try again.");
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [attempt]);

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

    if (!recoveryUserId) {
      setError("Please open a valid password reset link.");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.updatePassword(password, recoveryUserId);
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage(result.message);
      setSuccess(true);
    } catch (err) {
      if (err instanceof AuthRequestError && err.status === 401) {
        setRecoveryUserId(null);
        setPassword("");
        setConfirmPassword("");
        setError(invalidLink);
        return;
      }
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
          <div role="status" className="flex justify-center py-4">
            <LoadingMark size={40} className="text-fg-tertiary" />
            <span className="sr-only">Verifying your reset link</span>
          </div>
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
        ) : !recoveryUserId ? (
          <div className="space-y-4">
            <p role="alert" className="text-fail">
              {error}
            </p>
            {verificationUnavailable && <Button variant="outline" onClick={() => {
              setVerificationUnavailable(false);
              setChecking(true);
              setAttempt((value) => value + 1);
            }}>Retry verification</Button>}

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
