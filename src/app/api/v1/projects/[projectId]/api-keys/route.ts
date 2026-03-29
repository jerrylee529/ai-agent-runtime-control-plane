import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { createApiKeySchema } from "@/lib/validators/project";
import { createApiKey, getProjectByIdForUser, listApiKeys } from "@/server/projects/service";

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const user = await requireCurrentUser();
  const project = await getProjectByIdForUser(projectId, user.id);

  if (!project) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Project not found" } },
      { status: 404 }
    );
  }

  const items = await listApiKeys(projectId);
  return NextResponse.json({ data: { items } });
}

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const body = await request.json();
  const parsed = createApiKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid API key payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const user = await requireCurrentUser();
  const project = await getProjectByIdForUser(projectId, user.id);

  if (!project) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Project not found" } },
      { status: 404 }
    );
  }

  const result = await createApiKey({
    projectId,
    name: parsed.data.name,
  });

  return NextResponse.json(
    {
      data: {
        apiKey: {
          ...result.apiKey,
          token: result.token,
        },
      },
    },
    { status: 201 }
  );
}
