
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/features/auth/services/auth-service";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let recoveryDetected = false;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          recoveryDetected = true;

          if (active) {
            setAuthorized(true);
            setChecking(false);
            setError("");
          }
        }
      }
    );

    async function verifyRecoveryLink() {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const code = url.searchParams.get("code");
      const type = url.searchParams.get("type");

      try {
        if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (error) throw error;

          if (active) {
            recoveryDetected = true;
            setAuthorized(true);
          }

          window.history.replaceState(
            {},
            "",
            "/reset-password"
          );
        } else if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;

          if (active) {
            recoveryDetected = true;
            setAuthorized(true);
          }

          window.history.replaceState(
            {},
            "",
            "/reset-password"
          );
        } else if (
          window.location.hash.includes("type=recovery")
        ) {
          // Supabase processes implicit recovery tokens
          // and emits PASSWORD_RECOVERY.
          await supabase.auth.getSession();
        }

        if (active && !recoveryDetected) {
          setError(
            "Invalid or expired reset link. Please request a new one."
          );
        }
      } catch {
        if (active) {
          setError(
            "Unable to verify your reset link. Please request a new one."
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    verifyRecoveryLink();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
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
      await authService.updatePassword(password);
      await createClient().auth.signOut();
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
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            Reset Password
          </h1>

          <p className="text-sm text-secondary">
            Create a new password for your BlindSpot account.
          </p>
        </div>

        {checking ? (
          <p className="text-secondary">
            Verifying your reset link...
          </p>
        ) : success ? (
          <div className="space-y-4">
            <p role="status" className="text-pass">
              Your password has been updated successfully!
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
                className="w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-primary"
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
                className="w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-primary"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-fail">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
