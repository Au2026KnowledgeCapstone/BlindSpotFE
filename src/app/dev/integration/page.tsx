"use client";

import { useState } from "react";
import { z } from "zod";

const healthSchema = z.object({ status: z.literal("ok"), message: z.string() });
const projectsSchema = z.object({ items: z.array(z.unknown()), next_cursor: z.string().nullable() });
const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

type CheckResult = { name: string; outcome: string };

export default function IntegrationCheckPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  async function runChecks() {
    if (!backendUrl || running) return;
    setRunning(true);
    setResults([]);
    try {
      const checks = await Promise.all([
        check("Backend health", "/", healthSchema),
        check("Projects API", "/api/projects", projectsSchema),
      ]);
      setResults(checks);
    } finally {
      setRunning(false);
    }
  }

  async function check(name: string, path: string, schema: z.ZodType): Promise<CheckResult> {
    try {
      const response = await fetch(`${backendUrl}${path}`, {
        cache: "no-store",
        credentials: "omit",
        // This header deliberately exercises browser OPTIONS preflight, too.
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 501) {
        return { name, outcome: "HTTP 501: backend reached; this API is not implemented yet." };
      }
      if (!response.ok) {
        return { name, outcome: `HTTP ${response.status}: check backend logs and access configuration.` };
      }
      const parsed = schema.safeParse(await response.json());
      return {
        name,
        outcome: parsed.success
          ? `HTTP ${response.status}: browser request and response validation passed.`
          : `HTTP ${response.status}: backend reached, but the response does not match the expected schema.`,
      };
    } catch {
      return { name, outcome: "Request failed: check the backend URL, CORS, network, IAM access and request timeout." };
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6 text-primary">
      <h1 className="text-xl font-semibold">Frontend / backend connection check</h1>
      <p className="text-sm text-secondary">
        These read-only checks run in your browser against the configured backend.
        They test connectivity and CORS, not Supabase authentication or project ownership.
      </p>
      <p className="break-all text-sm">Backend: {backendUrl ?? "Not configured"}</p>
      {!backendUrl && (
        <p role="alert" className="text-sm text-fail">
          Set NEXT_PUBLIC_API_BASE_URL during the frontend build, then rebuild and deploy.
        </p>
      )}
      <button
        type="button"
        disabled={!backendUrl || running}
        onClick={() => void runChecks()}
        className="rounded border border-border bg-panel px-4 py-2 text-sm disabled:opacity-50"
      >
        {running ? "Checking…" : "Run connection checks"}
      </button>
      <ul aria-live="polite" className="space-y-3">
        {results.map((result) => (
          <li key={result.name} className="rounded border border-border bg-panel p-4">
            <h2 className="font-medium">{result.name}</h2>
            <p className="mt-1 text-sm text-secondary">{result.outcome}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
