import Link from "next/link";

async function getProjects() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/projects`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load projects");
  }

  return response.json();
}

export default async function ProjectsPage() {
  const { data } = await getProjects();
  const projects = data.items as Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
  }>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Projects</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">AI Agent Runtime Control Plane</h1>
          </div>
          <Link
            href="/projects/new"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            New Project
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              No projects yet. Create your first project to continue.
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                    <p className="mt-2 text-sm text-slate-400">{project.slug}</p>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <p>Plan: {project.plan}</p>
                    <p>Status: {project.status}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
