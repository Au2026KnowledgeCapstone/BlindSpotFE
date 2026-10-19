
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signupSchema, type SignupFormValues } from "../schemas";
import { authService } from "../services/auth-service";

export function SignupForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /**
   * Registers a user through Supabase Auth.
   * If email confirmation is enabled, the user must verify
   * their email before signing in.
   */
  const onSubmit = async (values: SignupFormValues) => {
    setAuthError("");
    setSuccessMessage("");

    try {
      const { session } = await authService.signUp(values);

      if (session) {
        setSuccessMessage(
          "Account created successfully! You are signed in."
        );
      } else {
        setSuccessMessage(
          "Signup request submitted! Check your email to confirm your account."
        );
      }
    } catch (error) {
      console.error("Signup failed:", error);

      setAuthError(
        "Unable to create your account. Please try again."
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
          htmlFor="signup-email"
          className="text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
          className="w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-primary"
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
          htmlFor="signup-password"
          className="text-sm font-medium"
        >
          Password
        </label>

        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          {...register("password")}
          aria-invalid={!!errors.password}
          className="w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-primary"
        />

        <p className="text-xs text-secondary">
          Use at least 8 characters, including uppercase,
          lowercase, a number, and a special character.
        </p>

        {errors.password && (
          <p role="alert" className="text-sm text-fail">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm password field */}
      <div className="space-y-2">
        <label
          htmlFor="signup-confirm-password"
          className="text-sm font-medium"
        >
          Confirm password
        </label>

        <input
          id="signup-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          {...register("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
          className="w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-primary"
        />

        {errors.confirmPassword && (
          <p role="alert" className="text-sm text-fail">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      {/* Supabase authentication error */}
      {authError && (
        <p role="alert" className="text-sm text-fail">
          {authError}
        </p>
      )}

      {/* Account creation / email confirmation message */}
      {successMessage && (
        <p role="status" className="text-sm text-pass">
          {successMessage}
        </p>
      )}

      {/* Link to login page */}
      <p className="text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
