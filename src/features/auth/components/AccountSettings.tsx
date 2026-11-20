"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfilePreferences } from "./ProfilePreferences";
import { authService } from "../services/auth-service";

function useAccountEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authService.getUser().then((user) => {
      if (!active) return;
      if (user?.email) setEmail(user.email);
      else setError("Sign in to manage your account settings.");
    }).catch(() => {
      if (active) setError("Unable to load your account. Please reload to try again.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return { email, loading, error };
}

function PasswordSettings({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendResetLink() {
    setSending(true);
    setError("");
    setSent(false);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError("Unable to send a reset email. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-3" aria-labelledby="password-heading">
      <h2 id="password-heading" className="text-sm font-semibold">Password</h2>
      <p className="text-sm text-fg-secondary">We’ll email you a link to securely change your password.</p>
      <Button variant="outline" onClick={sendResetLink} disabled={!email || sending || sent}>
        {sending ? "Sending..." : sent ? "Reset email sent" : "Send password reset email"}
      </Button>
      {sent && <p role="status" className="text-sm text-pass">Check your inbox for your password reset link.</p>}
      {error && <p role="alert" className="text-sm text-fail">{error}</p>}
    </section>
  );
}

export function AccountSettings() {
  const router = useRouter();
  const { email, loading, error } = useAccountEmail();

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg-tertiary">Manage your personal identity, workspace display preferences, and account security.</p></div><Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="size-4" />Back</Button></div>
      {loading && <p role="status" className="text-sm text-fg-tertiary">Loading account...</p>}
      {error && <p role="alert" className="text-sm text-fail">{error}</p>}
      <ProfilePreferences email={email} />
      <div className="rounded-[24px] border border-border bg-panel p-7"><PasswordSettings email={email} /></div>
    </div>
  );
}
