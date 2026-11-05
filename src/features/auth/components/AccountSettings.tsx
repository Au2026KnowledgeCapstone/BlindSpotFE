"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "../services/auth-service";
import { useThemeStore, type Theme } from "@/shared/ui/theme-store";

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
    <section className="space-y-3 border-t border-border pt-5" aria-labelledby="password-heading">
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

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function AppearanceSettings() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <section className="space-y-3 border-t border-border pt-5" aria-labelledby="appearance-heading">
      <h2 id="appearance-heading" className="text-sm font-semibold">Appearance</h2>
      <p className="text-sm text-fg-secondary">
        Choose how BlindSpot looks on this device. This preference is stored in your browser only.
      </p>
      <div className="flex gap-2" role="radiogroup" aria-labelledby="appearance-heading">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant={theme === value ? "secondary" : "outline"}
            role="radio"
            aria-checked={theme === value}
            onClick={() => setTheme(value)}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Button>
        ))}
      </div>
    </section>
  );
}

export function AccountSettings() {
  const { email, loading, error } = useAccountEmail();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Account settings</h1>
        <p className="text-sm text-fg-secondary">Manage your BlindSpot account and security.</p>
      </div>
      <div className="space-y-5 rounded-lg border border-border bg-panel p-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Email address</h2>
          {loading ? <p role="status" className="text-sm text-fg-secondary">Loading account...</p> : email && <p className="break-words text-sm text-fg-secondary">{email}</p>}
          {error && <p role="alert" className="text-sm text-fail">{error}</p>}
        </div>
        <PasswordSettings email={email} />
        <AppearanceSettings />
      </div>
    </div>
  );
}
