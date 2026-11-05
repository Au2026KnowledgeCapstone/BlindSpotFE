import { backendAuth } from "./backend-auth";

import { createClient } from "@/lib/supabase/client";
import type { SignupFormValues } from "../schemas";

/**
 * Browser-side authentication operations for BlindSpot.
 * Backend cookies handle login/current-user/logout.
 * Signup and recovery temporarily retain their separate Supabase SDK session.
 */
export const authService = {
  // Cookie sessions are verified and refreshed only through the backend.
  signIn: backendAuth.signIn,
  getUser: backendAuth.getUser,

  // Register a new user.
  async signUp({ email, password }: SignupFormValues) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  signOut: backendAuth.signOut,

  // Send a password reset email.
  async requestPasswordReset(email: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  // Update the user's password after recovery.
  async updatePassword(newPassword: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

};

