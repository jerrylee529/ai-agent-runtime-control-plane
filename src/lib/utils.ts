import { randomBytes } from "crypto";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function generateApiKey() {
  return `aircp_${randomBytes(24).toString("hex")}`;
}

export function getKeyPrefix(key: string) {
  return key.slice(0, 12);
}

export function getDevUser() {
  return {
    id: process.env.DEV_USER_ID ?? "dev-user-1",
    email: process.env.DEV_USER_EMAIL ?? "dev@local.test",
    name: "Dev User",
  };
}
