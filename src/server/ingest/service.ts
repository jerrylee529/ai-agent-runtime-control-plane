import { db } from "@/lib/db";
import { hashApiKey } from "@/lib/crypto";

type ProjectScopedIngestAuth = {
  projectId: string;
  apiKeyId: string;
};

type StartRunInput = {
  projectId: string;
  workflowName: string;
  workflowId?: string;
  externalRunId?: string;
  environment?: string;
  triggerType?: string;
  startedAt: string;
  inputSummary?: string;
  sourceUserId?: string;
  sessionId?: string;
  tags?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type FinishRunInput = {
  projectId: string;
  runId: string;
  status: "success" | "failed" | "cancelled";
  endedAt: string;
  outputSummary?: string;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalCostUsd?: number;
  errorType?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
};

type StartStepInput = {
  projectId: string;
  runId: string;
  parentStepId?: string | null;
  sequenceNo: number;
  stepName: string;
  stepType: string;
  provider?: string;
  model?: string;
  toolName?: string;
  actionName?: string;
  targetSystem?: string;
  startedAt: string;
  inputPreview?: string;
  approvalStatus?: string;
  metadata?: Record<string, unknown>;
};

type FinishStepInput = {
  projectId: string;
  stepId: string;
  status: "success" | "failed" | "skipped" | "blocked";
  endedAt: string;
  outputPreview?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  errorType?: string | null;
  errorMessage?: string | null;
  approvalStatus?: string;
  retryCount?: number;
  metadata?: Record<string, unknown>;
};

function diffMs(startedAt: Date, endedAt: Date) {
  return Math.max(0, endedAt.getTime() - startedAt.getTime());
}

export async function authenticateIngestApiKey(rawApiKey: string): Promise<ProjectScopedIngestAuth | null> {
  const keyHash = hashApiKey(rawApiKey);
  const apiKey = await db.apiKey.findFirst({
    where: {
      keyHash,
      status: "active",
      revokedAt: null,
    },
  });

  if (!apiKey) return null;

  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    projectId: apiKey.projectId,
    apiKeyId: apiKey.id,
  };
}

export async function startRun(input: StartRunInput) {
  return db.run.create({
    data: {
      projectId: input.projectId,
      workflowId: input.workflowId,
      workflowNameSnapshot: input.workflowName,
      externalRunId: input.externalRunId,
      environment: input.environment || "prod",
      status: "running",
      triggerType: input.triggerType,
      startedAt: new Date(input.startedAt),
      inputSummary: input.inputSummary,
      sourceUserId: input.sourceUserId,
      sessionId: input.sessionId,
      tagsJson: input.tags,
      metadataJson: input.metadata,
    },
  });
}

export async function finishRun(input: FinishRunInput) {
  const run = await db.run.findFirst({
    where: {
      id: input.runId,
      projectId: input.projectId,
    },
  });

  if (!run) {
    throw new Error("RUN_NOT_FOUND");
  }

  if (run.status !== "running") {
    throw new Error("RUN_ALREADY_FINISHED");
  }

  const endedAt = new Date(input.endedAt);

  return db.run.update({
    where: { id: run.id },
    data: {
      status: input.status,
      endedAt,
      totalLatencyMs: diffMs(run.startedAt, endedAt),
      totalInputTokens: input.totalInputTokens ?? run.totalInputTokens,
      totalOutputTokens: input.totalOutputTokens ?? run.totalOutputTokens,
      totalCostUsd: input.totalCostUsd ?? run.totalCostUsd,
      outputSummary: input.outputSummary,
      errorType: input.errorType,
      errorMessage: input.errorMessage,
      metadataJson: input.metadata ? { ...(run.metadataJson as object | null), ...input.metadata } : run.metadataJson,
    },
  });
}

export async function startStep(input: StartStepInput) {
  const run = await db.run.findFirst({
    where: {
      id: input.runId,
      projectId: input.projectId,
    },
  });

  if (!run) {
    throw new Error("RUN_NOT_FOUND");
  }

  return db.step.create({
    data: {
      runId: input.runId,
      parentStepId: input.parentStepId,
      sequenceNo: input.sequenceNo,
      stepName: input.stepName,
      stepType: input.stepType,
      status: "running",
      provider: input.provider,
      model: input.model,
      toolName: input.toolName,
      actionName: input.actionName,
      targetSystem: input.targetSystem,
      startedAt: new Date(input.startedAt),
      runStartedOffsetMs: diffMs(run.startedAt, new Date(input.startedAt)),
      inputPreview: input.inputPreview,
      approvalStatus: input.approvalStatus || "not_applicable",
      metadataJson: input.metadata,
    },
  });
}

export async function finishStep(input: FinishStepInput) {
  const step = await db.step.findFirst({
    where: {
      id: input.stepId,
      run: {
        projectId: input.projectId,
      },
    },
  });

  if (!step) {
    throw new Error("STEP_NOT_FOUND");
  }

  if (step.status !== "running") {
    throw new Error("STEP_ALREADY_FINISHED");
  }

  const endedAt = new Date(input.endedAt);

  return db.step.update({
    where: { id: step.id },
    data: {
      status: input.status,
      endedAt,
      latencyMs: diffMs(step.startedAt, endedAt),
      outputPreview: input.outputPreview,
      inputTokens: input.inputTokens ?? step.inputTokens,
      outputTokens: input.outputTokens ?? step.outputTokens,
      costUsd: input.costUsd ?? step.costUsd,
      errorType: input.errorType,
      errorMessage: input.errorMessage,
      approvalStatus: input.approvalStatus ?? step.approvalStatus,
      retryCount: input.retryCount ?? step.retryCount,
      metadataJson: input.metadata ? { ...(step.metadataJson as object | null), ...input.metadata } : step.metadataJson,
    },
  });
}
