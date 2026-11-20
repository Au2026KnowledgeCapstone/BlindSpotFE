
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import type { Run } from "../types";
import { workspaceApi } from "@/features/workspace/workspace-api";
import { mapResult } from "../api/map-result";

const COLORS = {
  pass: "var(--bs-pass)",
  fail: "var(--bs-fail)",
  inconclusive: "var(--bs-warn)",
};

export function TestResultsChart({
  projectId,
  runs,
}: {
  projectId: string;
  runs: Run[];
}) {
  const results = useQuery({
    queryKey: [
      "workspace",
      projectId,
      "test-results",
      runs.map((run) => run.id),
    ],
    enabled: runs.length > 0,
    retry: false,
    queryFn: async () => {
      const groups = await Promise.all(
        runs.map((run) =>
          workspaceApi.listResults(
            projectId,
            run.environmentId,
            run.id,
          ),
        ),
      );

      return groups.flat().map(mapResult);
    },
  });

  if (runs.length === 0) {
    return (
      <section className="mt-6 rounded-xl border border-border bg-panel p-5">
        <h2 className="text-sm font-semibold">Test results</h2>
        <p className="mt-3 text-sm text-fg-secondary">
          No test results available yet. Start a run to see results here.
        </p>
      </section>
    );
  }

  if (results.isPending) {
    return (
      <section className="mt-6 rounded-xl border border-border bg-panel p-5">
        <h2 className="text-sm font-semibold">Test results</h2>
        <p className="mt-4 text-sm text-fg-secondary">
          Loading test results...
        </p>
      </section>
    );
  }

  if (results.isError) {
    return (
      <section className="mt-6 rounded-xl border border-border bg-panel p-5">
        <h2 className="text-sm font-semibold">Test results</h2>
        <p className="mt-3 text-sm text-fail">
          Test results are currently unavailable.
        </p>
      </section>
    );
  }

  const data = [
    {
      name: "Passed",
      value: results.data.filter((r) => r.verdict === "pass").length,
      color: COLORS.pass,
    },
    {
      name: "Failed",
      value: results.data.filter((r) => r.verdict === "fail").length,
      color: COLORS.fail,
    },
    {
      name: "Inconclusive",
      value: results.data.filter((r) => r.verdict === "inconclusive").length,
      color: COLORS.inconclusive,
    },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="mt-6 rounded-xl border border-border bg-panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Test results</h2>
          <p className="mt-1 text-xs text-fg-tertiary">
            Breakdown across all project runs
          </p>
        </div>
        <span className="font-mono text-2xl">{total}</span>
      </div>

      {total === 0 ? (
        <p className="py-12 text-center text-sm text-fg-secondary">
          No test results recorded yet.
        </p>
      ) : (
        <>
          <div className="mx-auto mt-4 h-64 w-full max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
            {data.map((item) => (
              <div key={item.name}>
                <div className="flex items-center gap-2 text-xs text-fg-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </div>
                <p className="mt-1 font-mono text-xl">{item.value}</p>
                <p className="text-xs text-fg-tertiary">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}