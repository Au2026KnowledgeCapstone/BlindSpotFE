"use client";

import { useState } from "react";
import { z } from "zod";

// Matches BlindSpotBE main.py `liveness`, which returns {"status": "ok"} alone.
const healthSchema = z.object({ status: z.literal("ok") });
const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

type CheckResult = { name: string; outcome: string };
type CheckOptions = { schema?: z.ZodType; expectUnauthorized?: boolean };

export default function IntegrationCheckPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  async function runChecks() {
    if (!backendUrl || running) return;
    setRunning(true);
    setResults([]);
    try {
      const checks = await Promise.all([
        check("Backend health", "/", { schema: healthSchema }),
        // Called without credentials on purpose: a 401 is the pass condition,
        // proving the request reached the backend and access control is live.
        check("Projects API", "/projects", { expectUnauthorized: true }),
      ]);
      setResults(checks);
    } finally {
      setRunning(false);
    }
  }

  // eslint-disable-next-line complexity -- One readable ladder from CORS reachability down to response shape.
  async function check(name: string, path: string, options: CheckOptions = {}): Promise<CheckResult> {
    try {
      const response = await fetch(`${backendUrl}${path}`, {
        cache: "no-store",
        credentials: "omit",
        // The header the real client sends on writes. Being non-simple it forces
        // an OPTIONS preflight, so this also proves BE allowlists it.
        headers: { "X-CSRF-Protection": "1" },
        signal: AbortSignal.timeout(15000),
      });
      if (options.expectUnauthorized && (response.status === 401 || response.status === 403)) {
        return { name, outcome: `HTTP ${response.status}: backend reached through CORS and access control is enforced.` };
      }
      if (response.status === 501) {
        return { name, outcome: "HTTP 501: backend reached; this API is not implemented yet." };
      }
      if (!response.ok) {
        return { name, outcome: `HTTP ${response.status}: check backend logs and access configuration.` };
      }
      if (options.expectUnauthorized) {
        return { name, outcome: `HTTP ${response.status}: backend reached, but this endpoint answered without a session.` };
      }
      if (!options.schema) {
        return { name, outcome: `HTTP ${response.status}: backend reached through CORS.` };
      }
      const parsed = options.schema.safeParse(await response.json());
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
