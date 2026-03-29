import { NextRequest, NextResponse } from "next/server";
import { stepFinishSchema } from "@/lib/validators/ingest";
import { finishStep } from "@/server/ingest/service";
import { requireIngestAuth } from "../../../_shared";

export async function POST(request: NextRequest, context: { params: Promise<{ stepId: string }> }) {
  const authResult = await requireIngestAuth(request);
  if ("error" in authResult) return authResult.error;

  const { stepId } = await context.params;
  const body = await request.json();
  const parsed = stepFinishSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid step finish payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  try {
    const step = await finishStep({
      projectId: authResult.auth.projectId,
      stepId,
      ...parsed.data,
    });

    return NextResponse.json({ data: { step } });
  } catch (error) {
    if (error instanceof Error && error.message === "STEP_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "step_not_found", message: "Step not found" } },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === "STEP_ALREADY_FINISHED") {
      return NextResponse.json(
        { error: { code: "step_already_finished", message: "Step already finalized" } },
        { status: 409 }
      );
    }

    throw error;
  }
}
