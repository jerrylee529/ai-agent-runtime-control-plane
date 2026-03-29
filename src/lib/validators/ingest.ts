import { z } from "zod";

const isoDate = z.union([z.string().datetime(), z.string().min(1)]);

export const runStartSchema = z.object({
  workflowName: z.string().min(1).max(120),
  workflowId: z.string().uuid().optional(),
  externalRunId: z.string().max(200).optional(),
  environment: z.string().max(50).optional(),
  triggerType: z.string().max(50).optional(),
  startedAt: isoDate,
  inputSummary: z.string().max(2000).optional(),
  sourceUserId: z.string().max(120).optional(),
  sessionId: z.string().max(120).optional(),
  tags: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const runFinishSchema = z.object({
  status: z.enum(["success", "failed", "cancelled"]),
  endedAt: isoDate,
  outputSummary: z.string().max(2000).optional(),
  totalInputTokens: z.number().int().nonnegative().optional(),
  totalOutputTokens: z.number().int().nonnegative().optional(),
  totalCostUsd: z.number().nonnegative().optional(),
  errorType: z.string().max(100).nullable().optional(),
  errorMessage: z.string().max(2000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const stepStartSchema = z.object({
  runId: z.string().uuid(),
  parentStepId: z.string().uuid().nullable().optional(),
  sequenceNo: z.number().int().positive(),
  stepName: z.string().min(1).max(120),
  stepType: z.enum(["llm", "tool", "retrieval", "memory", "validation", "logic", "action", "other"]),
  provider: z.string().max(100).optional(),
  model: z.string().max(120).optional(),
  toolName: z.string().max(120).optional(),
  actionName: z.string().max(120).optional(),
  targetSystem: z.string().max(120).optional(),
  startedAt: isoDate,
  inputPreview: z.string().max(4000).optional(),
  approvalStatus: z.enum(["not_applicable", "allowed", "blocked", "needs_review"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const stepFinishSchema = z.object({
  status: z.enum(["success", "failed", "skipped", "blocked"]),
  endedAt: isoDate,
  outputPreview: z.string().max(4000).optional(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  errorType: z.string().max(100).nullable().optional(),
  errorMessage: z.string().max(2000).nullable().optional(),
  approvalStatus: z.enum(["not_applicable", "allowed", "blocked", "needs_review"]).optional(),
  retryCount: z.number().int().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
