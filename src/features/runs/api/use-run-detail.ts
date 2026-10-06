import { useQuery } from "@tanstack/react-query";
import { runSchema } from "./run.schema";
import { testStepRunSchema } from "./test-step.schema";
import { failureSchema } from "./failure.schema";
import { mapRun } from "./map-run";
import { mapTestStepRun } from "./map-test-step";
import { mapFailure } from "./map-failure";
import { makeRun, fixtureCheckoutSteps, fixtureFailure } from "@/test/fixtures";
import type { Run, TestStepRun, Failure } from "../types";

export interface RunDetailData {
  run: Run;
  steps: TestStepRun[];
  failure?: Failure | undefined;
}

const svgMockScreenshot = (title: string, subtitle: string, isError = false) => {
  const bg = isError ? "rgb(26,8,8)" : "rgb(15,16,17)";
  const border = isError ? "rgb(255,107,107)" : "rgb(51,53,56)";
  const accent = isError ? "rgb(255,107,107)" : "rgb(124,147,255)";
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='100%' height='100%' fill='${bg}'/><rect x='40' y='40' width='720' height='420' rx='8' fill='rgb(20,21,22)' stroke='${border}' stroke-width='2'/><circle cx='70' cy='70' r='6' fill='rgb(255,107,107)'/><circle cx='90' cy='70' r='6' fill='rgb(242,184,75)'/><circle cx='110' cy='70' r='6' fill='rgb(76,195,138)'/><text x='140' y='75' fill='rgb(138,143,152)' font-family='monospace' font-size='12'>https://store.acme.dev/checkout</text><text x='400' y='230' fill='white' font-family='sans-serif' font-size='22' font-weight='600' text-anchor='middle'>${title}</text><text x='400' y='270' fill='${accent}' font-family='sans-serif' font-size='14' text-anchor='middle'>${subtitle}</text></svg>`;
};

export function useRunDetail(runId: string) {
  return useQuery<RunDetailData>({
    queryKey: ["run", runId],
    queryFn: async () => {
      const rawRun = runSchema.parse(makeRun({ id: runId }));
      const rawSteps = fixtureCheckoutSteps.map((s) => testStepRunSchema.parse(s));
      const rawFailure = failureSchema.parse(fixtureFailure);

      const steps: TestStepRun[] = rawSteps.map((s, idx) => {
        const mapped = mapTestStepRun(s);
        const isFailedStep = mapped.status === "failed";
        const title = mapped.title;

        return {
          ...mapped,
          screenshotUrl: svgMockScreenshot(
            title,
            isFailedStep ? "Error: HTTP 500 Internal Server Error" : `Completed successfully (${mapped.durationMs}ms)`,
            isFailedStep
          ),
          beforeScreenshotUrl: svgMockScreenshot(`${title} (Before)`, "Initial state"),
          afterScreenshotUrl: svgMockScreenshot(
            `${title} (After)`,
            isFailedStep ? "Failed at POST /api/orders" : "State updated successfully",
            isFailedStep
          ),
          consoleLogs: [
            { id: `c-${idx}-1`, timestamp: "09:41:02", level: "info", message: `[router] Navigated to step ${mapped.stepNumber}: ${title}` },
            ...(isFailedStep
              ? [
                  { id: `c-${idx}-2`, timestamp: "09:41:13", level: "warn" as const, message: "POST /api/orders request pending..." },
                  { id: `c-${idx}-3`, timestamp: "09:41:14", level: "error" as const, message: "Failed to load resource: net::ERR_HTTP_RESPONSE_CODE_FAILURE 500 (Internal Server Error)" },
                ]
              : [{ id: `c-${idx}-2`, timestamp: "09:41:03", level: "info" as const, message: "Step completed without errors" }]),
          ],
          networkLogs: [
            { id: `n-${idx}-1`, timestamp: "09:41:01", method: "GET", url: `/api/session`, status: 200, durationMs: 14 },
            { id: `n-${idx}-2`, timestamp: "09:41:02", method: "GET", url: `/api/flow/${mapped.id}`, status: 200, durationMs: 32 },
            ...(isFailedStep
              ? [
                  { id: `n-${idx}-3`, timestamp: "09:41:13", method: "POST", url: "/api/orders", status: 500, durationMs: 3012 },
                ]
              : [
                  { id: `n-${idx}-3`, timestamp: "09:41:03", method: "POST", url: "/api/analytics/event", status: 204, durationMs: 45 },
                ]),
          ],
        };
      });

      return {
        run: mapRun(rawRun),
        steps,
        failure: mapFailure(rawFailure),
      };
    },
  });
}
