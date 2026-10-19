
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { signupSchema, type SignupFormValues } from "../schemas";

export function SignupForm() {
  const [validated, setValidated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Temporary validation until Supabase Auth is integrated.
  const onSubmit = () => {
    setValidated(true);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => setValidated(false)}
      noValidate
      className="space-y-5"
    >
      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-medium">
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
        <label htmlFor="signup-password" className="text-sm font-medium">
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
      <Button type="submit" variant="outline" className="w-full">
        Submit
      </Button>

      {validated && (
        <p role="status" className="text-sm text-secondary">
          Details validated. Account creation will be enabled
          when Supabase is connected.
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

