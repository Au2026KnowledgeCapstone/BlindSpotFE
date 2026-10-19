/**
 * Password validation rules for BlindSpot signup:
 *
 * 1. Must contain at least 8 characters.
 * 2. Must contain at least one uppercase letter (A-Z).
 * 3. Must contain at least one lowercase letter (a-z).
 * 4. Must contain at least one number (0-9).
 * 5. Must contain at least one special character (!@#$%^&*()_+-=).
 *
 * These rules apply only to signup, not login.
 * The final password policy should match Supabase Auth
 * once authentication is integrated.
 */
import { z } from "zod";

// Login validation
export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Password requirements for signup
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(
    /[!@#$%^&*()_+\-=]/,
    "Include at least one special character"
  );

// Signup validation
export const signupSchema = z
  .object({
    email: z.email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;