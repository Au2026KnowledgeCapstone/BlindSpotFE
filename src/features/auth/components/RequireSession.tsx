"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "../services/auth-service";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";
import { Button } from "@/components/ui/button";
import { AuthRequestError } from "../services/backend-auth";

/** UI guard only. Backend feature endpoints still require their own authorization. */
export function RequireSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [result, setResult] = useState<
    | { status: "verifying" | "authenticated" | "unauthenticated" }
    | { status: "unavailable"; path: string; message: string; offerSignIn: boolean }
  >({ status: "verifying" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let generation = 0;
    async function check() {
      const current = ++generation;
      try {
        const user = await authService.getUser();
        if (!active || current !== generation) return;
        if (!user) {
          setResult({ status: "unauthenticated" });
          router.replace("/login");
        } else {
          setResult({ status: "authenticated" });
        }
      } catch (error) {
        if (active && current === generation) {
          setResult({ status: "unavailable", path: pathname,
            offerSignIn: error instanceof AuthRequestError && error.code === "renewal_unsupported",
            message: error instanceof AuthRequestError
              ? `Unable to verify your session. ${error.message}`
              : "Unable to verify your session. Please try again." });
        }
      }
    }
    // Focus also fires when a native file picker closes. Keep mounted form state
    // while checking; a failed check still hides protected content.
    const recheck = () => { void check(); };
    const authChanged = () => { setResult({ status: "verifying" }); void check(); };
    const visible = () => { if (document.visibilityState === "visible") recheck(); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = authChanged;
    window.addEventListener("focus", recheck);
    window.addEventListener("pageshow", recheck);
    window.addEventListener("blindspot:auth-changed", authChanged);
    document.addEventListener("visibilitychange", visible);
    void check();
    return () => {
      active = false;
      window.removeEventListener("focus", recheck);
      window.removeEventListener("pageshow", recheck);
      window.removeEventListener("blindspot:auth-changed", authChanged);
      document.removeEventListener("visibilitychange", visible);
      channel?.close();
    };
  }, [attempt, pathname, router]);

  // Keep the authenticated layout mounted during navigation rechecks.
  // Explicit account changes still clear readiness before checking again.
  if (result.status === "authenticated") return children;
  if (result.status === "unavailable" && result.path === pathname) return (
    <div className="space-y-3 p-6">
      <p role="alert" className="text-fail">{result.message}</p>
      <Button variant="outline" onClick={() => {
        setResult({ status: "verifying" });
        setAttempt((value) => value + 1);
      }}>Retry session check</Button>
      {result.offerSignIn && <Link href="/login" className="ml-4 text-sm text-accent hover:underline">Sign in again</Link>}
    </div>
  );
  return <LoadingScreen label="Checking session" className="min-h-screen" />;
}
