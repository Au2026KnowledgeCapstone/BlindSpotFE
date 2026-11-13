"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { backendAuth } from "@/features/auth";
import { workspaceApi } from "./workspace-api";

export function useDashboard() {
  const cache = useQueryClient();
  const [identityVersion, setIdentityVersion] = useState(0);
  useEffect(() => {
    const clear = () => {
      void (async () => {
        await cache.cancelQueries({ queryKey: ["workspace"] });
        cache.removeQueries({ queryKey: ["workspace"] });
        setIdentityVersion((version) => version + 1);
      })();
    };
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("blindspot-auth") : null;
    if (channel) channel.onmessage = clear;
    window.addEventListener("blindspot:auth-changed", clear);
    return () => { window.removeEventListener("blindspot:auth-changed", clear); channel?.close(); };
  }, [cache]);

  const identity = useQuery({ queryKey: ["workspace", "identity", identityVersion], queryFn: async () => {
    const user = await backendAuth.getUser();
    if (!user) throw new Error("Sign in to open your dashboard.");
    return user;
  }, retry: false, staleTime: 0, gcTime: 0 });
  const userId = identity.data?.id;
  const projects = useQuery({ queryKey: ["workspace", userId, "projects"], queryFn: () => workspaceApi.projects(), enabled: !!userId, retry: false });
  const invitations = useQuery({ queryKey: ["workspace", userId, "invitations"], queryFn: workspaceApi.myInvitations, enabled: !!userId, retry: false });
  async function acceptInvitation(id: string) {
    await workspaceApi.acceptInvitation(id);
    await cache.invalidateQueries({ queryKey: ["workspace"] });
  }
  return { identity, projects, invitations, acceptInvitation };
}
