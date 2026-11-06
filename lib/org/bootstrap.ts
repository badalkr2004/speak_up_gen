import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  geoCity,
  geoState,
  membership,
  orgUnit,
  unitKind,
  user,
} from "@/lib/db/schema";
import { INDIA_STATES, SEED_CITIES, UNIT_KINDS } from "@/lib/org/geo-data";
import { createId } from "@/lib/org/ids";

export const NATIONAL_UNIT_ID = "ou_national";

export async function ensureGeoAndKinds() {
  const db = getDb();

  for (const state of INDIA_STATES) {
    await db
      .insert(geoState)
      .values(state)
      .onConflictDoNothing({ target: geoState.code });
  }

  for (const city of SEED_CITIES) {
    await db.insert(geoCity).values(city).onConflictDoNothing({ target: geoCity.id });
  }

  for (const kind of UNIT_KINDS) {
    await db
      .insert(unitKind)
      .values({
        id: kind.id,
        key: kind.key,
        label: kind.label,
        description: kind.description,
        isActive: 1,
      })
      .onConflictDoNothing({ target: unitKind.id });
  }
}

export async function ensureNationalUnit(createdByUserId?: string) {
  const db = getDb();
  await ensureGeoAndKinds();

  const existing = await db
    .select()
    .from(orgUnit)
    .where(eq(orgUnit.id, NATIONAL_UNIT_ID))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(orgUnit).values({
      id: NATIONAL_UNIT_ID,
      parentId: null,
      level: "national",
      name: "Speak Up Gen National",
      slug: "national",
      status: "active",
      createdByUserId: createdByUserId ?? null,
    });
  }

  return NATIONAL_UNIT_ID;
}

export async function promoteNationalAdmin(email: string) {
  const db = getDb();
  const normalized = email.trim().toLowerCase();

  const [found] = await db
    .select()
    .from(user)
    .where(eq(user.email, normalized))
    .limit(1);

  if (!found) {
    throw new Error(`No user found with email ${normalized}. Sign up first.`);
  }

  await ensureNationalUnit(found.id);

  const [mine] = await db
    .select()
    .from(membership)
    .where(
      and(
        eq(membership.userId, found.id),
        eq(membership.orgUnitId, NATIONAL_UNIT_ID),
        eq(membership.roleKey, "national_admin"),
      ),
    )
    .limit(1);

  if (mine) {
    if (mine.status !== "active") {
      await db
        .update(membership)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(membership.id, mine.id));
    }
    return { userId: found.id, membershipId: mine.id, created: false };
  }

  const membershipId = createId("mem");
  await db.insert(membership).values({
    id: membershipId,
    userId: found.id,
    orgUnitId: NATIONAL_UNIT_ID,
    roleKey: "national_admin",
    status: "active",
    approvedAt: new Date(),
    approvedByUserId: found.id,
  });

  return { userId: found.id, membershipId, created: true };
}
