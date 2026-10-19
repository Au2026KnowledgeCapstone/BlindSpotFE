"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "../schemas";

export function LoginForm() {
  const [validated, setValidated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Temporary behavior until Supabase is integrated.
  const onSubmit = () => {
    setValidated(true);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Email field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
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
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password")}
          className="w-full rounded-lg border border-border bg-raised px-3 py-2 text-sm text-primary"
        />

        {errors.password && (
          <p role="alert" className="text-sm text-fail">
            {errors.password.message}
          </p>
        )}
      </div>

      
        <Button type="submit" variant="outline" className="w-full">
        Submit
        </Button>

        <p className="text-center text-sm text-secondary">
        Don't have an account?{" "}
        <Link
            href="/signup"
            className="font-medium text-accent hover:underline"
        >
            Sign up
        </Link>
        </p>


      {validated && (
        <p role="status" className="text-sm text-secondary">
          Input validated. Authentication will be enabled
          when Supabase is connected.
        </p>
      )}
    </form>
  );
}
