
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "../schemas";
import { AuthRequestError } from "../services/backend-auth";
import { authService } from "../services/auth-service";
import { WorkspaceApiError, workspaceApi } from "@/features/workspace";
import { FIELD } from "@/shared/ui/field";

function workspaceFailure(error: unknown) {
  if (error instanceof WorkspaceApiError && error.status === 401) return "Your workspace session could not be verified. Retry or sign in again.";
  if (error instanceof WorkspaceApiError && error.status === 403) return "Your account could not access its workspaces. Retry or sign in with another account.";
  return "Could not load your workspaces. Check your connection and retry.";
}

function WorkspaceContinuation({ error, loading, onContinue, onSignIn }: {
  error: string;
  loading: boolean;
  onContinue: () => void;
  onSignIn: () => void;
}) {
  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-fail">{error}</p>}
      <Button className="h-11 w-full" disabled={loading} onClick={onContinue}>
        {loading ? "Loading workspace…" : error ? "Retry workspace lookup" : "Continue to workspace"}
      </Button>
      <div className="flex flex-wrap justify-between gap-2 text-sm font-medium text-accent">
        <button type="button" disabled={loading} className="hover:underline" onClick={onSignIn}>Sign in again</button>
        <Link href="/resend-confirmation" className="hover:underline">Resend confirmation email</Link>
      </div>
    </div>
  );
}

export function LoginForm({ checkExistingSession = false }: { checkExistingSession?: boolean }) {
  const router = useRouter();
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(checkExistingSession);
  const [signedIn, setSignedIn] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);

  useEffect(() => {
    if (!checkExistingSession) return;
    let active = true;
    void authService.getUser().then((user) => {
      if (active) setSignedIn(Boolean(user));
    }).catch(() => {
      if (active) setAuthError("Could not verify an existing session. You can sign in below.");
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [checkExistingSession]);

  const {
    register, reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function openWorkspace() {
    setLoadingWorkspace(true);
    setAuthError("");
    try {
      const projects = await workspaceApi.projects();
      router.replace(projects.length > 0 ? "/dashboard" : "/onboarding");
      router.refresh();
    } catch (error) {
      setAuthError(workspaceFailure(error));
    } finally {
      setLoadingWorkspace(false);
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError("");
    try {
      await authService.signIn(values);
    } catch (error) {
      setAuthError(error instanceof AuthRequestError ? error.message :
        "Unable to sign in. Please try again.");
      return;
    }
    reset();
    if (typeof window !== "undefined") window.sessionStorage.removeItem("blindspot-onboarding-request");
    setSignedIn(true);
    await openWorkspace();
  };

  if (checking) return <p role="status" className="text-sm text-fg-secondary">Checking your session…</p>;
  if (signedIn) return (
    <WorkspaceContinuation error={authError} loading={loadingWorkspace} onContinue={() => void openWorkspace()}
      onSignIn={() => {
        setSignedIn(false);
        setAuthError("");
      }}
    />
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Email field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
          className={`${FIELD} h-11 rounded-full px-4`}
        />

        {errors.email && (
          <p role="alert" className="text-sm text-fail">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password")}
          aria-invalid={!!errors.password}
          className={`${FIELD} h-11 rounded-full px-4`}
        />

        {errors.password && (
          <p role="alert" className="text-sm text-fail">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-x-4 gap-y-2">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-accent hover:underline"
        >
          Forgot password?
        </Link>
        <Link href="/resend-confirmation" className="text-sm font-medium text-accent hover:underline">
          Resend confirmation email
        </Link>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="h-11 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      {/* Authentication error */}
      {authError && (
        <p role="alert" className="text-sm text-fail">
          {authError}
        </p>
      )}

      {/* Link to signup */}
      <p className="text-center text-sm text-fg-secondary">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
