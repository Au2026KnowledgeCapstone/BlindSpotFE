"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { backendAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { workspaceApi } from "./workspace-api";

// eslint-disable-next-line complexity -- Keep the small identity-aware notification state machine together.
export function NotificationsPanel() {
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
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  async function markRead(id: string) {
    setPendingId(id);
    setActionError("");
    try {
      await workspaceApi.markNotificationRead(id);
      await cache.invalidateQueries({ queryKey: ["workspace", identity.data?.id, "notifications"] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update notification. Retry.");
    } finally { setPendingId(null); }
  }

  if (identity.isPending) return <p role="status" className="px-3 py-2 text-xs text-fg-tertiary">Checking notifications…</p>;
  if (identity.error) return <p role="alert" className="px-3 py-2 text-xs text-fail">{identity.error.message}</p>;
  if (notifications.isPending) return <p role="status" className="px-3 py-2 text-xs text-fg-tertiary">Loading notifications…</p>;
  if (notifications.error) return <div className="px-3 py-2 text-xs text-fail"><p role="alert">{notifications.error.message}</p><Button variant="ghost" size="sm" onClick={() => void notifications.refetch()}>Retry</Button></div>;
  const unreadCount = notifications.data?.filter((notice) => !notice.read_at).length ?? 0;
  return <section aria-label="Notifications" className="border-t border-border p-3">
    <h2 className="mb-2 text-xs font-semibold text-fg">Notifications <span aria-label={`${unreadCount} unread`}>({unreadCount} unread)</span></h2>
    {actionError && <p role="alert" className="mb-2 text-fail">{actionError}</p>}
    {notifications.data?.length ? <ul className="space-y-2">{notifications.data.map((notice) => <li key={notice.id} className="rounded-md bg-raised p-2 text-xs">
      <p>{notice.message}</p>
      {notice.read_at ? <p className="mt-1 text-fg-tertiary">Read</p> : <Button variant="ghost" size="sm" disabled={pendingId === notice.id} onClick={() => void markRead(notice.id)}>{pendingId === notice.id ? "Marking…" : "Mark as read"}</Button>}
    </li>)}</ul> : <p className="text-xs text-fg-tertiary">No notifications.</p>}
  </section>;
}
