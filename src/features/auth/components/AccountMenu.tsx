"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { CircleUserRound, LogOut, Settings } from "lucide-react";
import { authService } from "../services/auth-service";

const itemClassName = "flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-fg-secondary outline-none data-[highlighted]:bg-hover data-[highlighted]:text-fg data-[disabled]:cursor-wait data-[disabled]:opacity-50";

function AccountMenuItems({ loading, onLogout }: { loading: boolean; onLogout: () => void }) {
  return (
    <Menu.Portal>
      <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
        <Menu.Popup className="w-52 rounded-lg border border-border bg-overlay p-1 shadow-overlay outline-none">
          <Menu.LinkItem render={<Link href="/account/settings" />} closeOnClick className={itemClassName}>
            <Settings aria-hidden="true" className="size-4" />
            Account settings
          </Menu.LinkItem>
          <Menu.Item onClick={onLogout} disabled={loading} closeOnClick={false} className={itemClassName}>
            <LogOut aria-hidden="true" className="size-4" />
            {loading ? "Logging out..." : "Log out"}
          </Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function AccountMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await authService.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to log out. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center">
      <Menu.Root>
        <Menu.Trigger aria-label="Account menu" className="flex size-8 items-center justify-center rounded-full border border-border bg-raised text-fg-secondary hover:bg-hover hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50">
          <CircleUserRound aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </Menu.Trigger>
        <AccountMenuItems loading={loading} onLogout={handleLogout} />
      </Menu.Root>
      {error && <p role="alert" className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-border bg-overlay p-3 text-sm text-fail shadow-overlay">{error}</p>}
    </div>
  );
}
