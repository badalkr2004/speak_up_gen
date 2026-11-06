import { eq } from "drizzle-orm";
import {
  getActiveMemberships,
  type RoleKey,
} from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { orgUnit } from "@/lib/db/schema";

export type OrgLevel = "national" | "state" | "city" | "unit";

async function getUnit(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(orgUnit)
    .where(eq(orgUnit.id, id))
    .limit(1);
  return row ?? null;
}

export async function isNationalAdmin(userId: string) {
  const memberships = await getActiveMemberships(userId);
  return memberships.some((m) => m.roleKey === "national_admin");
}

/** Who may create a child under parentUnitId. */
export async function canManageChildren(
  userId: string,
  parentUnitId: string,
): Promise<boolean> {
  if (await isNationalAdmin(userId)) return true;

  const parent = await getUnit(parentUnitId);
  if (!parent) return false;

  const memberships = await getActiveMemberships(userId);

  if (parent.level === "national") {
    return memberships.some((m) => m.roleKey === "national_admin");
  }
  if (parent.level === "state") {
    return memberships.some(
      (m) =>
        m.orgUnitId === parent.id &&
        (m.roleKey === "state_lead" || m.roleKey === "national_admin"),
    );
  }
  if (parent.level === "city") {
    return memberships.some(
      (m) =>
        (m.orgUnitId === parent.id && m.roleKey === "city_lead") ||
        (m.orgUnitId === parent.parentId && m.roleKey === "state_lead"),
    );
  }
  return false;
}

export async function canAssignLeadOnUnit(userId: string, unitId: string) {
  if (await isNationalAdmin(userId)) return true;
  const unit = await getUnit(unitId);
  if (!unit) return false;
  const memberships = await getActiveMemberships(userId);

  if (unit.level === "unit" && unit.parentId) {
    return memberships.some(
      (m) => m.orgUnitId === unit.parentId && m.roleKey === "city_lead",
    );
  }
  if (unit.level === "city" && unit.parentId) {
    return memberships.some(
      (m) => m.orgUnitId === unit.parentId && m.roleKey === "state_lead",
    );
  }
  if (unit.level === "state") {
    return memberships.some((m) => m.roleKey === "national_admin");
  }
  return false;
}

export function defaultLeadRoleForLevel(level: OrgLevel): RoleKey {
  switch (level) {
    case "national":
      return "national_admin";
    case "state":
      return "state_lead";
    case "city":
      return "city_lead";
    case "unit":
      return "unit_lead";
  }
}
