import Link from "next/link";
import { RevokeButton } from "./api-keys/[keyId]/revoke-button";

async function getProject(projectId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [projectRes, apiKeysRes] = await Promise.all([
    fetch(`${baseUrl}/api/v1/projects/${projectId}`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/v1/projects/${projectId}/api-keys`, { cache: "no-store" }),
  ]);

  if (!projectRes.ok) {
    throw new Error("Failed to load project");
  }

  const projectPayload = await projectRes.json();
  const apiKeysPayload = apiKeysRes.ok ? await apiKeysRes.json() : { data: { items: [] } };

  return {
    project: projectPayload.data.project,
    apiKeys: apiKeysPayload.data.items,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, apiKeys } = await getProject(projectId);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Project</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{project.name}</h1>
          <p className="mt-3 text-sm text-slate-400">{project.slug}</p>
          <p className="mt-3 text-xs text-slate-500">Project ID: {project.id}</p>
          {project.description ? <p className="mt-4 text-slate-300">{project.description}</p> : null}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">API Keys</h2>
              <p className="mt-2 text-sm text-slate-400">Create and manage ingestion keys for this project.</p>
            </div>
            <Link
              href={`/projects/${project.id}/api-keys/new`}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
            >
              Create API key
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {apiKeys.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                No API keys yet.
              </div>
            ) : (
              apiKeys.map(
                (item: { id: string; name: string; keyPrefix: string; status: string }) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.keyPrefix}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                        {item.status}
                      </span>
                      {item.status !== "revoked" ? (
                        <RevokeButton projectId={project.id} keyId={item.id} />
                      ) : null}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
