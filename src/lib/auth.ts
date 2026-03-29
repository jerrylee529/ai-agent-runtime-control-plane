import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function requireCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("Unable to resolve user email");
  }

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return existing;
  }

  return db.user.create({
    data: {
      id: userId,
      email,
      name: [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || clerkUser?.username || "User",
    },
  });
}
