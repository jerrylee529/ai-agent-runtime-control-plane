-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "environment_default" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "workflow_id" UUID,
    "workflow_name_snapshot" TEXT NOT NULL,
    "external_run_id" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'prod',
    "status" TEXT NOT NULL,
    "trigger_type" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6),
    "total_latency_ms" INTEGER,
    "total_input_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_output_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_cost_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "input_summary" TEXT,
    "output_summary" TEXT,
    "error_type" TEXT,
    "error_message" TEXT,
    "source_user_id" TEXT,
    "session_id" TEXT,
    "tags_json" JSONB,
    "metadata_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "parent_step_id" UUID,
    "sequence_no" INTEGER NOT NULL,
    "step_name" TEXT NOT NULL,
    "step_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "tool_name" TEXT,
    "action_name" TEXT,
    "target_system" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6),
    "run_started_offset_ms" INTEGER,
    "latency_ms" INTEGER,
    "input_preview" TEXT,
    "output_preview" TEXT,
    "input_tokens" INTEGER NOT NULL DEFAULT 0,
    "output_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "error_type" TEXT,
    "error_message" TEXT,
    "approval_status" TEXT NOT NULL DEFAULT 'not_applicable',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_pricing" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "pricing_unit" TEXT NOT NULL DEFAULT 'per_1m_tokens',
    "input_price_per_million" DECIMAL(18,6) NOT NULL,
    "output_price_per_million" DECIMAL(18,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "effective_from" TIMESTAMPTZ(6) NOT NULL,
    "effective_to" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_usage_daily" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "usage_date" DATE NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "success_runs" INTEGER NOT NULL DEFAULT 0,
    "failed_runs" INTEGER NOT NULL DEFAULT 0,
    "total_input_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_output_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_cost_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "avg_latency_ms" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "project_usage_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_usage_daily" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "workflow_id" UUID NOT NULL,
    "usage_date" DATE NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "failed_runs" INTEGER NOT NULL DEFAULT 0,
    "total_cost_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "avg_latency_ms" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "workflow_usage_daily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_owner_user_id_idx" ON "projects"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_project_id_idx" ON "api_keys"("project_id");

-- CreateIndex
CREATE INDEX "workflows_project_id_idx" ON "workflows"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflows_project_id_slug_key" ON "workflows"("project_id", "slug");

-- CreateIndex
CREATE INDEX "runs_project_id_started_at_idx" ON "runs"("project_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "runs_project_id_status_started_at_idx" ON "runs"("project_id", "status", "started_at" DESC);

-- CreateIndex
CREATE INDEX "runs_project_id_workflow_name_snapshot_started_at_idx" ON "runs"("project_id", "workflow_name_snapshot", "started_at" DESC);

-- CreateIndex
CREATE INDEX "runs_workflow_id_started_at_idx" ON "runs"("workflow_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "runs_project_id_external_run_id_idx" ON "runs"("project_id", "external_run_id");

-- CreateIndex
CREATE INDEX "steps_run_id_sequence_no_idx" ON "steps"("run_id", "sequence_no");

-- CreateIndex
CREATE INDEX "steps_run_id_status_idx" ON "steps"("run_id", "status");

-- CreateIndex
CREATE INDEX "steps_step_type_idx" ON "steps"("step_type");

-- CreateIndex
CREATE INDEX "steps_model_idx" ON "steps"("model");

-- CreateIndex
CREATE INDEX "steps_tool_name_idx" ON "steps"("tool_name");

-- CreateIndex
CREATE INDEX "steps_target_system_idx" ON "steps"("target_system");

-- CreateIndex
CREATE UNIQUE INDEX "steps_run_id_sequence_no_key" ON "steps"("run_id", "sequence_no");

-- CreateIndex
CREATE INDEX "model_pricing_provider_model_effective_from_idx" ON "model_pricing"("provider", "model", "effective_from" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "project_usage_daily_project_id_usage_date_key" ON "project_usage_daily"("project_id", "usage_date");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_usage_daily_project_id_workflow_id_usage_date_key" ON "workflow_usage_daily"("project_id", "workflow_id", "usage_date");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_parent_step_id_fkey" FOREIGN KEY ("parent_step_id") REFERENCES "steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_usage_daily" ADD CONSTRAINT "project_usage_daily_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_usage_daily" ADD CONSTRAINT "workflow_usage_daily_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_usage_daily" ADD CONSTRAINT "workflow_usage_daily_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
