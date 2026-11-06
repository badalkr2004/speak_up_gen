import { randomBytes } from "node:crypto";

/** URL-safe short id for org rows (not for secrets). */
export function createId(prefix: string) {
  return `${prefix}_${randomBytes(10).toString("hex")}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
