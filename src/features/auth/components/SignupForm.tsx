
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signupSchema, type SignupFormValues } from "../schemas";
import { authService } from "../services/auth-service";
import { AuthRequestError } from "../services/backend-auth";
import { FIELD } from "@/shared/ui/field";

export function SignupForm() {
  const router = useRouter();
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
      const { authenticated } = await authService.signUp(values);

      if (authenticated) {
        if (typeof window !== "undefined") window.sessionStorage.removeItem("blindspot-onboarding-request");
        router.replace("/onboarding");
        router.refresh();
        return;
      }
      setSuccessMessage("If confirmation is still needed, check your email for a link. Open it in this browser.");
    } catch (error) {
      setAuthError(error instanceof AuthRequestError ? error.message : "Unable to create your account. Please try again.");
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
          className={`${FIELD} h-11 rounded-full px-4`}
        />

        <p className="text-xs text-fg-secondary">
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
          className={`${FIELD} h-11 rounded-full px-4`}
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
      <p className="text-center text-sm text-fg-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-accent">
        <Link href="/forgot-password" className="hover:underline">Forgot password?</Link>
        <Link href="/resend-confirmation" className="hover:underline">Resend confirmation email</Link>
      </div>
    </form>
  );
}
