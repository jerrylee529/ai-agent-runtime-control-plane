import { db } from "@/lib/db";
import { hashApiKey } from "@/lib/crypto";
import { generateApiKey, getKeyPrefix, slugify } from "@/lib/utils";

type CreateProjectInput = {
  ownerUserId: string;
  name: string;
  slug?: string;
  description?: string | null;
};

type CreateApiKeyInput = {
  projectId: string;
  name: string;
};

export async function createProject(input: CreateProjectInput) {
  const slug = slugify(input.slug || input.name);

  return db.project.create({
    data: {
      ownerUserId: input.ownerUserId,
      name: input.name,
      slug,
      description: input.description || null,
    },
  });
}

export async function listProjectsForUser(ownerUserId: string) {
  return db.project.findMany({
    where: { ownerUserId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectByIdForUser(projectId: string, ownerUserId: string) {
  return db.project.findFirst({
    where: {
      id: projectId,
      ownerUserId,
    },
  });
}

export async function createApiKey(input: CreateApiKeyInput) {
  const token = generateApiKey();
  const keyHash = hashApiKey(token);
  const keyPrefix = getKeyPrefix(token);

  const apiKey = await db.apiKey.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      keyHash,
      keyPrefix,
    },
  });

  return {
    apiKey,
    token,
  };
}

export async function listApiKeys(projectId: string) {
  return db.apiKey.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiKey(projectId: string, keyId: string) {
  const existing = await db.apiKey.findFirst({
    where: { id: keyId, projectId },
  });

  if (!existing) {
    throw new Error("API key not found");
  }

  return db.apiKey.update({
    where: { id: keyId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
    },
  });
}
