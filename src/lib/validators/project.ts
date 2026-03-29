import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(120),
});
