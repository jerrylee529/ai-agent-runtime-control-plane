import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { UserNav } from "@/components/user-nav";

const setupChecklist = [
  "Next.js + TypeScript app scaffolded",
  "Prisma schema applied to PostgreSQL",
  "React Query provider wired",
  "Project and API key flows are in progress",
];

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12 sm:px-10 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              AI Agent Runtime Control Plane
            </p>
          </div>
          <UserNav isSignedIn={isSignedIn} />
        </div>

        <div className="mt-16 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Observability and control for production AI agents.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            The engineering repo is live. Foundation work is in progress: schema,
            app shell, auth, providers, and project setup are now taking shape.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {setupChecklist.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-200 shadow-lg shadow-black/20"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Next implementation steps</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Finish authenticated project and API key management</li>
            <li>Add ingestion endpoints for runs and steps</li>
            <li>Build the run detail timeline UI</li>
            <li>Connect a real workflow end to end</li>
          </ul>
        </div>

        <div className="mt-10 flex items-center gap-3">
          {!isSignedIn ? (
            <SignInButton mode="modal" fallbackRedirectUrl="/projects" signUpFallbackRedirectUrl="/projects">
              <span className="inline-flex cursor-pointer rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400">
                Sign in to continue
              </span>
            </SignInButton>
          ) : (
            <Link
              href="/projects"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
            >
              Open projects
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
