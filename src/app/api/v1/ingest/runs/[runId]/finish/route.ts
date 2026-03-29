import { NextRequest, NextResponse } from "next/server";
import { runFinishSchema } from "@/lib/validators/ingest";
import { finishRun } from "@/server/ingest/service";
import { requireIngestAuth } from "../../../_shared";

export async function POST(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  const authResult = await requireIngestAuth(request);
  if ("error" in authResult) return authResult.error;

  const { runId } = await context.params;
  const body = await request.json();
  const parsed = runFinishSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid run finish payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  try {
    const run = await finishRun({
      projectId: authResult.auth.projectId,
      runId,
      ...parsed.data,
    });

    return NextResponse.json({ data: { run } });
  } catch (error) {
    if (error instanceof Error && error.message === "RUN_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "run_not_found", message: "Run not found" } },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === "RUN_ALREADY_FINISHED") {
      return NextResponse.json(
        { error: { code: "run_already_finished", message: "Run already finalized" } },
        { status: 409 }
      );
    }

    throw error;
  }
}
