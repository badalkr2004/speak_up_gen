/**
 * Promote a signed-up user to national admin and seed geo/unit kinds.
 *
 * Usage:
 *   bun scripts/seed-admin.ts you@example.com
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: bun scripts/seed-admin.ts <email>");
    process.exit(1);
  }

  const { promoteNationalAdmin } = await import("../lib/org/bootstrap");
  const result = await promoteNationalAdmin(email);
  console.log(
    result.created
      ? `Granted national_admin to ${email} (${result.userId})`
      : `Updated existing national_admin for ${email} (${result.userId})`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
