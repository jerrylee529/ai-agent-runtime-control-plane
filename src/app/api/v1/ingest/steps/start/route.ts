import { NextRequest, NextResponse } from "next/server";
import { stepStartSchema } from "@/lib/validators/ingest";
import { startStep } from "@/server/ingest/service";
import { requireIngestAuth } from "../../_shared";

export async function POST(request: NextRequest) {
  const authResult = await requireIngestAuth(request);
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = stepStartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid step start payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  try {
    const step = await startStep({
      projectId: authResult.auth.projectId,
      ...parsed.data,
    });

    return NextResponse.json({ data: { step } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "RUN_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "run_not_found", message: "Run not found" } },
        { status: 404 }
      );
    }

    throw error;
  }
}
