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

export function useRunDetail(runId: string) {
  return useQuery<RunDetailData>({
    queryKey: ["run", runId],
    queryFn: async () => {
      const rawRun = runSchema.parse(makeRun({ id: runId }));
      const rawSteps = fixtureCheckoutSteps.map((s) => testStepRunSchema.parse(s));
      const rawFailure = failureSchema.parse(fixtureFailure);

      return {
        run: mapRun(rawRun),
        steps: rawSteps.map(mapTestStepRun),
        failure: mapFailure(rawFailure),
      };
    },
  });
}
