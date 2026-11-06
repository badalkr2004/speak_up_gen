import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { membership, orgUnit } from "@/lib/db/schema";

export type RoleKey =
  | "national_admin"
  | "state_lead"
  | "city_lead"
  | "unit_lead"
  | "member"
  | "volunteer";

const LEAD_ROLES: RoleKey[] = [
  "national_admin",
  "state_lead",
  "city_lead",
  "unit_lead",
];

/**
 * Pure helper: can this role approve applications for a unit at this level?
 * Local lead rule — unit leads approve their unit; city lead can cover
 * units under their city when a unit has no lead yet (fallback).
 */
export function canRoleApproveForLevel(
  role: RoleKey,
  targetLevel: "national" | "state" | "city" | "unit",
  mode: "exact" | "city_fallback" = "exact",
): boolean {
  if (role === "national_admin") return true;
  if (mode === "exact" && role === "unit_lead" && targetLevel === "unit") {
    return true;
  }
  if (
    mode === "city_fallback" &&
    role === "city_lead" &&
    targetLevel === "unit"
  ) {
    return true;
  }
  if (role === "state_lead" && (targetLevel === "city" || targetLevel === "unit")) {
    return false;
  }
  return false;
}

export function isLeadRole(role: RoleKey): boolean {
  return LEAD_ROLES.includes(role);
}

/** Active memberships for a user — used by route guards and approve flows. */
export async function getActiveMemberships(userId: string) {
  const db = getDb();
  return db
    .select({
      membershipId: membership.id,
      orgUnitId: membership.orgUnitId,
      roleKey: membership.roleKey,
      status: membership.status,
      unitLevel: orgUnit.level,
      parentId: orgUnit.parentId,
    })
    .from(membership)
    .innerJoin(orgUnit, eq(membership.orgUnitId, orgUnit.id))
    .where(
      and(eq(membership.userId, userId), eq(membership.status, "active")),
    );
}

/**
 * Server-side check: may this user approve applications for targetOrgUnitId?
 * Delegates to the fixed capability matrix in lib/org/access.
 */
export async function canApproveApplication(
  userId: string,
  targetOrgUnitId: string,
): Promise<boolean> {
  const { can } = await import("@/lib/org/access");
  return can(userId, "approve_application", targetOrgUnitId);
}

export async function assertCanApproveApplication(
  userId: string,
  targetOrgUnitId: string,
) {
  const { assertCan } = await import("@/lib/org/access");
  await assertCan(userId, "approve_application", targetOrgUnitId);
}

export async function listLeadMemberships(userId: string) {
  const rows = await getActiveMemberships(userId);
  return rows.filter((m) => isLeadRole(m.roleKey as RoleKey));
}

export async function hasAnyLeadRole(userId: string) {
  const db = getDb();
  const rows = await db
    .select({ id: membership.id })
    .from(membership)
    .where(
      and(
        eq(membership.userId, userId),
        eq(membership.status, "active"),
        inArray(membership.roleKey, LEAD_ROLES),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
