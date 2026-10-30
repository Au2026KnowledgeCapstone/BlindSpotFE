"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type Project = { id: string; name: string; owner_id: string; description: string };
export type Application = { id: string; name: string; project_id: string };
export type Environment = { id: string; name: string; kind: string; base_url: string };
export type Scan = { id: string; status: string; created_at: string };
export type Result = { id: string; name: string; status: string; summary: string };
export type Invitation = { id: string; email: string; role: string; accepted_at: string | null; expires_at: string; project_id: string };
export type Notice = { id: string; message: string; read_at: string | null };

function check(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new Error("That item already exists.");
  if (error.code === "42501") throw new Error("You do not have permission for this action.");
  if (error.code === "23514") throw new Error("Check the entered values and try again.");
  throw new Error("The request could not be completed. Try again or contact your project owner.");
}

export function useWorkspace(projectId: string) {
  const client = useMemo(() => createClient(), []);
  const cache = useQueryClient();
  const identity = useQuery({
    queryKey: ["workspace", "identity"],
    queryFn: async () => {
      const { data, error } = await client.auth.getUser();
      if (error || !data.user) throw new Error("Sign in to open your workspace.");
      return data.user;
    },
    retry: false,
  });
  const projects = useQuery({
    queryKey: ["workspace", identity.data?.id, "projects"],
    enabled: !!identity.data,
    queryFn: async ({ signal }) => {
      const { data, error } = await client.from("projects").select("id,name,owner_id,description").order("created_at").limit(100).abortSignal(signal);
      check(error);
      return (data ?? []) as Project[];
    },
  });
  const active = projectId || projects.data?.[0]?.id || "";
  const details = useQuery({
    queryKey: ["workspace", identity.data?.id, active, "details"],
    enabled: !!identity.data && !!active,
    queryFn: ({ signal }) => fetchDetails(client, active, signal),
  });
  const inbox = useQuery({
    queryKey: ["workspace", identity.data?.id, "inbox"],
    enabled: !!identity.data,
    queryFn: ({ signal }) => fetchInbox(client, signal),
  });
  const mutation = useMutation({
    mutationFn: async (action: () => PromiseLike<{ error: { code?: string } | null }>) => {
      check((await action()).error);
    },
    onSuccess: async () => { await cache.invalidateQueries({ queryKey: ["workspace"] }); },
  });
  return { client, identity, projects, details, inbox, active, mutation };
}

async function fetchDetails(client: ReturnType<typeof createClient>, active: string, signal: AbortSignal) {
      const responses = await Promise.all([
        client.from("applications").select("id,name,project_id").eq("project_id", active).order("created_at").limit(100).abortSignal(signal),
        client.from("environments").select("id,name,kind,base_url").eq("project_id", active).order("created_at").limit(100).abortSignal(signal),
        client.from("scans").select("id,status,created_at").eq("project_id", active).order("created_at", { ascending: false }).limit(20).abortSignal(signal),
        client.from("test_results").select("id,name,status,summary").eq("project_id", active).order("created_at", { ascending: false }).limit(20).abortSignal(signal),
      ]);
      responses.forEach(({ error }) => check(error));
      return {
        applications: (responses[0].data ?? []) as Application[],
        environments: (responses[1].data ?? []) as Environment[],
        scans: (responses[2].data ?? []) as Scan[],
        results: (responses[3].data ?? []) as Result[],
      };
}

async function fetchInbox(client: ReturnType<typeof createClient>, signal: AbortSignal) {
      const [invitations, notices] = await Promise.all([
        client.from("invitations").select("id,email,role,accepted_at,expires_at,project_id").is("accepted_at", null).gt("expires_at", new Date().toISOString()).limit(100).abortSignal(signal),
        client.from("notifications").select("id,message,read_at").order("created_at", { ascending: false }).limit(30).abortSignal(signal),
      ]);
      check(invitations.error); check(notices.error);
      return { invitations: (invitations.data ?? []) as Invitation[], notices: (notices.data ?? []) as Notice[] };
}
