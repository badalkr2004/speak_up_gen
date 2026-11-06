/**
 * Compatibility shims — prefer lib/org/access.ts for new code.
 */
export {
  can as canCapability,
  assertCan,
  isNationalAdmin,
  getAssignableRoles,
  getScopedOrgRoots,
  hasAnyLeadRole,
  requiredLevelForRole,
  type Capability,
  type OrgLevel,
} from "@/lib/org/access";

import { can } from "@/lib/org/access";

/** @deprecated use can(userId, "create_unit"|"create_city"|"create_state", parentId) */
export async function canManageChildren(userId: string, parentUnitId: string) {
  const { getOrgNode } = await import("@/lib/org/access");
  const parent = await getOrgNode(parentUnitId);
  if (!parent) return false;
  if (parent.level === "national") {
    return can(userId, "create_state", parentUnitId);
  }
  if (parent.level === "state") {
    return can(userId, "create_city", parentUnitId);
  }
  if (parent.level === "city") {
    return can(userId, "create_unit", parentUnitId);
  }
  return false;
}

/** @deprecated use getAssignableRoles + assignRoleAction */
export async function canAssignLeadOnUnit(userId: string, unitId: string) {
  return can(userId, "assign_roles", unitId);
}

export function defaultLeadRoleForLevel(
  level: "national" | "state" | "city" | "unit",
) {
  switch (level) {
    case "national":
      return "national_admin" as const;
    case "state":
      return "state_lead" as const;
    case "city":
      return "city_lead" as const;
    case "unit":
      return "unit_lead" as const;
  }
}
