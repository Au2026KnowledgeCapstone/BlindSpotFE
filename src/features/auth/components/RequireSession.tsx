"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../services/auth-service";
import { LoadingScreen } from "@/shared/ui/LoadingScreen";

/** UI guard only. Backend feature endpoints still require their own authorization. */
export function RequireSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [result, setResult] = useState<{ path: string; ready: boolean; error?: string } | null>(null);

  useEffect(() => {
    let active = true;
    let generation = 0;
    async function check() {
      const current = ++generation;
      try {
        const user = await authService.getUser();
        if (!active || current !== generation) return;
        if (!user) {
          setResult({ path: pathname, ready: false });
          router.replace("/login");
        } else {
          setResult({ path: pathname, ready: true });
        }
      } catch {
        if (active && current === generation) {
          setResult({ path: pathname, ready: false,
            error: "Unable to verify your session. Check the backend and reload to try again." });
        }
      }
    }
    // Focus also fires when a native file picker closes. Keep mounted form state
    // while checking; a failed check still hides protected content.
    const recheck = () => { void check(); };
    const authChanged = () => { setResult(null); void check(); };
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
  }, [pathname, router]);

  // Keep the authenticated layout mounted during navigation rechecks.
  // Explicit account changes still clear readiness before checking again.
  if (result?.ready) return children;
  if (result?.path === pathname && result.error) return <p role="alert" className="p-6 text-fail">{result.error}</p>;
  return <LoadingScreen label="Checking session" className="min-h-screen" />;
}
