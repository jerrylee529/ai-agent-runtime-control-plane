"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RevokeButton({ projectId, keyId }: { projectId: string; keyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch(`/api/v1/projects/${projectId}/api-keys/${keyId}/revoke`, {
        method: "POST",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-rose-500 hover:text-rose-300 disabled:opacity-60"
    >
      {loading ? "Revoking..." : "Revoke"}
    </button>
  );
}
