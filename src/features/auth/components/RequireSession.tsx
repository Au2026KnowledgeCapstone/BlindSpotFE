"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../services/auth-service";

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
    const recheck = () => { setResult(null); void check(); };
    const visible = () => { if (document.visibilityState === "visible") recheck(); };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = recheck;
    window.addEventListener("focus", recheck);
    window.addEventListener("pageshow", recheck);
    window.addEventListener("blindspot:auth-changed", recheck);
    document.addEventListener("visibilitychange", visible);
    void check();
    return () => {
      active = false;
      window.removeEventListener("focus", recheck);
      window.removeEventListener("pageshow", recheck);
      window.removeEventListener("blindspot:auth-changed", recheck);
      document.removeEventListener("visibilitychange", visible);
      channel?.close();
    };
  }, [pathname, router]);

  if (result?.path === pathname && result.ready) return children;
  if (result?.path === pathname && result.error) return <p role="alert" className="p-6 text-fail">{result.error}</p>;
  return <p role="status" className="p-6 text-secondary">Checking session...</p>;
}
