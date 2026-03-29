import { UserButton, SignInButton } from "@clerk/nextjs";

type UserNavProps = {
  isSignedIn: boolean;
};

export function UserNav({ isSignedIn }: UserNavProps) {
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal" fallbackRedirectUrl="/projects" signUpFallbackRedirectUrl="/projects">
        <span className="inline-flex cursor-pointer rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400">
          Sign in
        </span>
      </SignInButton>
    );
  }

  return <UserButton afterSignOutUrl="/" />;
}
