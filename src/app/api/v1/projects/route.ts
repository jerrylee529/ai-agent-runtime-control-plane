import { NextRequest, NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validators/project";
import { createProject, listProjectsForUser } from "@/server/projects/service";

export async function GET() {
  const user = await requireCurrentUser();
  const projects = await listProjectsForUser(user.id);

  return NextResponse.json({ data: { items: projects } });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid project payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const user = await requireCurrentUser();
  const project = await createProject({
    ownerUserId: user.id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
  });

  return NextResponse.json({ data: { project } }, { status: 201 });
}
