"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function NewApiKeyPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/projects/${params.projectId}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Failed to create API key");
      }

      setToken(payload.data.apiKey.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function revokeAndReturn() {
    router.push(`/projects/${params.projectId}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">API key</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Create API key</h1>

        {token ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              Copy this key now. You will not be able to see it again.
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 break-all font-mono text-sm text-cyan-300">
              {token}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(token)}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
              >
                Copy key
              </button>
              <button
                type="button"
                onClick={revokeAndReturn}
                className="text-sm text-slate-300 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="production-sdk-key"
                required
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create key"}
              </button>
              <Link href={`/projects/${params.projectId}`} className="text-sm text-slate-400 hover:text-slate-200">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
