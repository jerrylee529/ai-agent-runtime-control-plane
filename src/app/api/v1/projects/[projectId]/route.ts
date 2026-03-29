import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { getProjectByIdForUser } from "@/server/projects/service";

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const user = await requireCurrentUser();
  const project = await getProjectByIdForUser(projectId, user.id);

  if (!project) {
    return NextResponse.json(
      {
        error: {
          code: "not_found",
          message: "Project not found",
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: { project } });
}
