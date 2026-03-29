import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { getProjectByIdForUser, revokeApiKey } from "@/server/projects/service";

export async function POST(_: Request, context: { params: Promise<{ projectId: string; keyId: string }> }) {
  const { projectId, keyId } = await context.params;
  const user = await requireCurrentUser();
  const project = await getProjectByIdForUser(projectId, user.id);

  if (!project) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Project not found" } },
      { status: 404 }
    );
  }

  const apiKey = await revokeApiKey(projectId, keyId);
  return NextResponse.json({ data: { apiKey } });
}
