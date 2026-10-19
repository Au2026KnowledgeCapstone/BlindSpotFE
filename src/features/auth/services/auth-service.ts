
import { createClient } from "@/lib/supabase/client";
import type { LoginFormValues, SignupFormValues } from "../schemas";

/**
 * Browser-side authentication operations for BlindSpot.
 * Supabase handles password verification and session creation.
 */
export const authService = {
  // Authenticate an existing user.
  async signIn({ email, password }: LoginFormValues) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

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

  // End the current user's session.
  async signOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

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

