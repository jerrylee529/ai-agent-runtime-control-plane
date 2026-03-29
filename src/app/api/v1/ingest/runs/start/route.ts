import { NextRequest, NextResponse } from "next/server";
import { runStartSchema } from "@/lib/validators/ingest";
import { startRun } from "@/server/ingest/service";
import { requireIngestAuth } from "../../_shared";

export async function POST(request: NextRequest) {
  const authResult = await requireIngestAuth(request);
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = runStartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid run start payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const run = await startRun({
    projectId: authResult.auth.projectId,
    ...parsed.data,
  });

  return NextResponse.json({ data: { run } }, { status: 201 });
}
