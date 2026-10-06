import { z } from "zod";

export const artifactSchema = z.object({
  id: z.string(),
  run_id: z.string(),
  step_run_id: z.string().optional(),
  type: z.enum(["screenshot", "trace", "console_log", "network_log", "video"]),
  url: z.string(),
  mime_type: z.string().optional(),
  created_at: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ArtifactSnakeCase = z.infer<typeof artifactSchema>;
