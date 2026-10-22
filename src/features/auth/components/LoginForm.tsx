
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "../schemas";
import { authService } from "../services/auth-service";
import { FIELD } from "@/shared/ui/field";

export function LoginForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Authenticates an existing user through Supabase.
   * Redirects to the dashboard after successful login.
   */
  const onSubmit = async (values: LoginFormValues) => {
    setAuthError("");

    try {
      const { session } = await authService.signIn(values);

      if (session) {
        router.replace("/projects/acme-corp");
        router.refresh();
      } else {
        setAuthError(
          "Unable to establish a session. Please try again."
        );
      }
    } catch {
      setAuthError(
        "Unable to sign in. Check your email, password, and email verification."
      );
    }
  };

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
          className={FIELD}
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
          className={FIELD}
        />

        {errors.password && (
          <p role="alert" className="text-sm text-fail">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot password link */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-accent hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="outline"
        className="w-full"
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
