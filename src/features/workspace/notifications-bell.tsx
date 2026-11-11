"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu } from "@base-ui/react/menu";
import { Bell } from "lucide-react";
import { backendAuth } from "@/features/auth";
import { workspaceApi } from "./workspace-api";
import type { WorkspaceApiTypes } from "./workspace-api";

type Notice = WorkspaceApiTypes["Notice"];

function useNotificationsData() {
  const cache = useQueryClient();
  const [identityVersion, setIdentityVersion] = useState(0);
  useEffect(() => {
    const refreshIdentity = () => {
      void (async () => {
        await cache.cancelQueries({ queryKey: ["workspace"] });
        cache.removeQueries({ queryKey: ["workspace"] });
        setIdentityVersion((version) => version + 1);
      })();
    };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = refreshIdentity;
    window.addEventListener("blindspot:auth-changed", refreshIdentity);
    return () => { window.removeEventListener("blindspot:auth-changed", refreshIdentity); channel?.close(); };
  }, [cache]);
  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: async () => {
    const user = await backendAuth.getUser();
    if (!user) throw new Error("Sign in to view notifications.");
    return user;
  }, retry: false, staleTime: 0, gcTime: 0 });
  const notifications = useQuery({
    queryKey: ["workspace", identity.data?.id, "notifications"],
    queryFn: workspaceApi.notifications,
    enabled: !!identity.data?.id,
    retry: false,
  });
  async function markAllRead(ids: string[]) {
    await Promise.all(ids.map((id) => workspaceApi.markNotificationRead(id)));
    await cache.invalidateQueries({ queryKey: ["workspace", identity.data?.id, "notifications"] });
  }
  return { identity, notifications, markAllRead };
}

/** Solid dot for exactly one unread notice; a counted circle for two or more — no badge at zero. */
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  if (count === 1) {
    return (
      <span
        aria-hidden="true"
        className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-fail ring-2 ring-panel"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fail px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-panel"
    >
      {count}
    </span>
  );
}

function NotificationRow({ notice }: { notice: Notice }) {
  return (
    <li
      className={`rounded-md border p-2 text-xs ${
        notice.read_at
          ? "border-border bg-panel text-fg-tertiary"
          : "border-border bg-raised text-fg"
      }`}
    >
      {notice.message}
    </li>
  );
}

function NotificationsBody({
  identity,
  notifications,
}: {
  identity: ReturnType<typeof useNotificationsData>["identity"];
  notifications: ReturnType<typeof useNotificationsData>["notifications"];
}) {
  if (identity.isPending || notifications.isPending) {
    return <p role="status" className="px-1 py-1 text-xs text-fg-tertiary">Loading…</p>;
  }
  if (identity.error) return <p role="alert" className="px-1 py-1 text-xs text-fail">{identity.error.message}</p>;
  if (notifications.error) return <p role="alert" className="px-1 py-1 text-xs text-fail">{notifications.error.message}</p>;
  if (!notifications.data?.length) return <p className="px-1 py-1 text-xs text-fg-tertiary">No notifications.</p>;
  return (
    <ul className="space-y-1">
      {notifications.data.map((notice) => <NotificationRow key={notice.id} notice={notice} />)}
    </ul>
  );
}

/**
 * Closing the dropdown — by clicking away, Escape, or the trigger — marks
 * every currently-unread notice read in one go. There's no per-item "Mark as
 * read" control anymore; the badge is cleared by the act of having looked.
 */
export function NotificationsBell() {
  const { identity, notifications, markAllRead } = useNotificationsData();
  const unreadIds = (notifications.data ?? []).filter((notice) => !notice.read_at).map((notice) => notice.id);
  const allIds = (notifications.data ?? []).map((notice) => notice.id);

  return (
    <Menu.Root onOpenChange={(open) => { if (!open && unreadIds.length) void markAllRead(unreadIds); }}>
      <div className="relative flex items-center">
        <Menu.Trigger
          aria-label={unreadIds.length ? `Notifications, ${unreadIds.length} unread` : "Notifications"}
          className="flex size-8 items-center justify-center rounded-full border border-border bg-raised text-fg-secondary hover:bg-hover hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50 data-[popup-open]:bg-hover"
        >
          <Bell aria-hidden="true" className="size-4" strokeWidth={1.5} />
        </Menu.Trigger>
        <NotificationBadge count={unreadIds.length} />
      </div>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="w-72 rounded-lg border border-border bg-overlay p-2 shadow-overlay outline-none">
            <div className="flex items-center justify-between pb-2">
              <p className="px-1 text-xs font-semibold text-fg">Notifications</p>
              {allIds.length > 0 && (
                // No "clear"/delete endpoint exists yet — this marks every
                // notice read as a stand-in until one does.
                <button
                  type="button"
                  onClick={() => void markAllRead(allIds)}
                  className="rounded px-1 text-xs text-fg-tertiary hover:text-fg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"
                >
                  Clear all
                </button>
              )}
            </div>
            <NotificationsBody identity={identity} notifications={notifications} />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
