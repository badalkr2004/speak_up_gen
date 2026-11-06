import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { membership, orgUnit } from "@/lib/db/schema";
import type { RoleKey } from "@/lib/auth/permissions";

export type Capability =
  | "manage_platform"
  | "create_state"
  | "create_city"
  | "create_unit"
  | "approve_application"
  | "assign_roles"
  | "view_directory"
  | "issue_id_card"
  | "suspend_member"
  | "view_org";

export type OrgLevel = "national" | "state" | "city" | "unit";

/** Fixed national policy — who may hold which capability (scope still required). */
const ROLE_CAPABILITIES: Record<RoleKey, readonly Capability[]> = {
  national_admin: [
    "manage_platform",
    "create_state",
    "create_city",
    "create_unit",
    "approve_application",
    "assign_roles",
    "view_directory",
    "issue_id_card",
    "suspend_member",
    "view_org",
  ],
  state_lead: [
    "create_city",
    "create_unit",
    "approve_application",
    "assign_roles",
    "view_directory",
    "issue_id_card",
    "suspend_member",
    "view_org",
  ],
  city_lead: [
    "create_unit",
    "approve_application",
    "assign_roles",
    "view_directory",
    "issue_id_card",
    "suspend_member",
    "view_org",
  ],
  unit_lead: [
    "approve_application",
    "assign_roles",
    "view_directory",
    "issue_id_card",
    "suspend_member",
    "view_org",
  ],
  member: ["issue_id_card"],
  volunteer: ["issue_id_card"],
};

/** Roles a given actor role is allowed to grant (appointment chain). */
const ASSIGNABLE_BY: Record<RoleKey, readonly RoleKey[]> = {
  national_admin: [
    "national_admin",
    "state_lead",
    "city_lead",
    "unit_lead",
    "member",
    "volunteer",
  ],
  state_lead: ["city_lead", "unit_lead", "member", "volunteer"],
  city_lead: ["unit_lead", "member", "volunteer"],
  unit_lead: ["member", "volunteer"],
  member: [],
  volunteer: [],
};

/** Target org level required for each role key. */
export function requiredLevelForRole(role: RoleKey): OrgLevel {
  switch (role) {
    case "national_admin":
      return "national";
    case "state_lead":
      return "state";
    case "city_lead":
      return "city";
    case "unit_lead":
    case "member":
    case "volunteer":
      return "unit";
  }
}

export type ActorLead = {
  membershipId: string;
  orgUnitId: string;
  roleKey: RoleKey;
  level: OrgLevel;
  parentId: string | null;
};

export type OrgNode = {
  id: string;
  parentId: string | null;
  level: OrgLevel;
  name: string;
  status: string;
  stateCode: string | null;
  cityId: string | null;
};

export function roleHasCapability(role: RoleKey, capability: Capability) {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function rolesAssignableBy(actorRole: RoleKey): readonly RoleKey[] {
  return ASSIGNABLE_BY[actorRole];
}

export async function getOrgNode(id: string): Promise<OrgNode | null> {
  const db = getDb();
  const [row] = await db
    .select({
      id: orgUnit.id,
      parentId: orgUnit.parentId,
      level: orgUnit.level,
      name: orgUnit.name,
      status: orgUnit.status,
      stateCode: orgUnit.stateCode,
      cityId: orgUnit.cityId,
    })
    .from(orgUnit)
    .where(eq(orgUnit.id, id))
    .limit(1);
  return (row as OrgNode | undefined) ?? null;
}

/** Walk parents until national root. */
export async function getAncestorChain(orgUnitId: string): Promise<OrgNode[]> {
  const chain: OrgNode[] = [];
  let currentId: string | null = orgUnitId;
  const seen = new Set<string>();

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    const node = await getOrgNode(currentId);
    if (!node) break;
    chain.push(node);
    currentId = node.parentId;
  }

  return chain;
}

export async function getActiveLeads(userId: string): Promise<ActorLead[]> {
  const db = getDb();
  const rows = await db
    .select({
      membershipId: membership.id,
      orgUnitId: membership.orgUnitId,
      roleKey: membership.roleKey,
      level: orgUnit.level,
      parentId: orgUnit.parentId,
    })
    .from(membership)
    .innerJoin(orgUnit, eq(membership.orgUnitId, orgUnit.id))
    .where(
      and(
        eq(membership.userId, userId),
        eq(membership.status, "active"),
        inArray(membership.roleKey, [
          "national_admin",
          "state_lead",
          "city_lead",
          "unit_lead",
        ]),
      ),
    );

  return rows.map((r) => ({
    membershipId: r.membershipId,
    orgUnitId: r.orgUnitId,
    roleKey: r.roleKey as RoleKey,
    level: r.level as OrgLevel,
    parentId: r.parentId,
  }));
}

export async function isNationalAdmin(userId: string) {
  const leads = await getActiveLeads(userId);
  return leads.some((l) => l.roleKey === "national_admin");
}

/**
 * Does this lead membership cover the resource node?
 * National covers all; others cover their node and descendants.
 */
export function leadCoversResource(
  lead: ActorLead,
  resourceChain: OrgNode[],
): boolean {
  if (lead.roleKey === "national_admin") return true;
  return resourceChain.some((n) => n.id === lead.orgUnitId);
}

export async function can(
  userId: string,
  capability: Capability,
  resourceOrgUnitId: string,
): Promise<boolean> {
  const leads = await getActiveLeads(userId);
  if (leads.length === 0) {
    // Members may issue their own card — handled by caller with ownership check
    return false;
  }

  const chain = await getAncestorChain(resourceOrgUnitId);
  if (chain.length === 0) return false;

  for (const lead of leads) {
    if (!roleHasCapability(lead.roleKey, capability)) continue;
    if (!leadCoversResource(lead, chain)) continue;

    // Unit lead: only resources that are their unit (or under — units have no children in our model)
    if (lead.roleKey === "unit_lead") {
      if (resourceOrgUnitId !== lead.orgUnitId) continue;
    }

    return true;
  }

  return false;
}

export async function assertCan(
  userId: string,
  capability: Capability,
  resourceOrgUnitId: string,
) {
  const ok = await can(userId, capability, resourceOrgUnitId);
  if (!ok) {
    throw new Error("You do not have permission for this action.");
  }
}

/** Highest-scope lead roots for org home navigation. */
export async function getScopedOrgRoots(userId: string): Promise<{
  isNationalAdmin: boolean;
  roots: OrgNode[];
  leads: ActorLead[];
}> {
  const leads = await getActiveLeads(userId);
  const national = leads.some((l) => l.roleKey === "national_admin");

  if (national) {
    const db = getDb();
    const [nat] = await db
      .select({
        id: orgUnit.id,
        parentId: orgUnit.parentId,
        level: orgUnit.level,
        name: orgUnit.name,
        status: orgUnit.status,
        stateCode: orgUnit.stateCode,
        cityId: orgUnit.cityId,
      })
      .from(orgUnit)
      .where(eq(orgUnit.level, "national"))
      .limit(1);
    return {
      isNationalAdmin: true,
      roots: nat ? [nat as OrgNode] : [],
      leads,
    };
  }

  // Prefer state roots over city over unit (dedupe)
  const preferred = leads
    .slice()
    .sort((a, b) => {
      const order = { state: 0, city: 1, unit: 2, national: -1 } as const;
      return (order[a.level] ?? 9) - (order[b.level] ?? 9);
    });

  const roots: OrgNode[] = [];
  const seen = new Set<string>();

  for (const lead of preferred) {
    if (seen.has(lead.orgUnitId)) continue;
    // Skip unit roots if we already have a parent city/state lead covering them
    const covered = roots.some((r) => {
      // rough: if lead is unit and we have city/state, skip unless unique
      return false;
    });
    void covered;

    const node = await getOrgNode(lead.orgUnitId);
    if (!node) continue;

    // If this node is descendant of an already-added root, skip
    const chain = await getAncestorChain(node.id);
    if (roots.some((r) => chain.some((c) => c.id === r.id) && r.id !== node.id)) {
      continue;
    }

    // Remove any existing roots that are descendants of this node
    const filtered = [] as OrgNode[];
    for (const r of roots) {
      const rChain = await getAncestorChain(r.id);
      if (rChain.some((c) => c.id === node.id) && r.id !== node.id) {
        continue;
      }
      filtered.push(r);
    }
    roots.length = 0;
    roots.push(...filtered, node);
    seen.add(node.id);
  }

  return { isNationalAdmin: false, roots, leads };
}

/** Collect all unit ids under a set of root org units (for approvals scope). */
export async function listUnitIdsInScope(userId: string): Promise<string[]> {
  const { isNationalAdmin: nat, leads } = await getScopedOrgRoots(userId);
  const db = getDb();

  if (nat) {
    const units = await db
      .select({ id: orgUnit.id })
      .from(orgUnit)
      .where(and(eq(orgUnit.level, "unit"), eq(orgUnit.status, "active")));
    return units.map((u) => u.id);
  }

  const unitIds = new Set<string>();

  for (const lead of leads) {
    if (lead.roleKey === "unit_lead") {
      unitIds.add(lead.orgUnitId);
      continue;
    }

    if (lead.roleKey === "city_lead") {
      const children = await db
        .select({ id: orgUnit.id })
        .from(orgUnit)
        .where(
          and(
            eq(orgUnit.parentId, lead.orgUnitId),
            eq(orgUnit.level, "unit"),
            eq(orgUnit.status, "active"),
          ),
        );
      for (const c of children) unitIds.add(c.id);
      continue;
    }

    if (lead.roleKey === "state_lead") {
      const cities = await db
        .select({ id: orgUnit.id })
        .from(orgUnit)
        .where(
          and(
            eq(orgUnit.parentId, lead.orgUnitId),
            eq(orgUnit.level, "city"),
            eq(orgUnit.status, "active"),
          ),
        );
      for (const city of cities) {
        const units = await db
          .select({ id: orgUnit.id })
          .from(orgUnit)
          .where(
            and(
              eq(orgUnit.parentId, city.id),
              eq(orgUnit.level, "unit"),
              eq(orgUnit.status, "active"),
            ),
          );
        for (const u of units) unitIds.add(u.id);
      }
    }
  }

  return [...unitIds];
}

/**
 * Which roles can this actor assign onto targetOrgUnitId?
 */
export async function getAssignableRoles(
  userId: string,
  targetOrgUnitId: string,
): Promise<RoleKey[]> {
  const leads = await getActiveLeads(userId);
  const chain = await getAncestorChain(targetOrgUnitId);
  const target = chain[0];
  if (!target) return [];

  const allowed = new Set<RoleKey>();

  for (const lead of leads) {
    if (!roleHasCapability(lead.roleKey, "assign_roles")) continue;
    if (!leadCoversResource(lead, chain)) continue;
    if (lead.roleKey === "unit_lead" && targetOrgUnitId !== lead.orgUnitId) {
      continue;
    }

    for (const role of rolesAssignableBy(lead.roleKey)) {
      if (requiredLevelForRole(role) === target.level) {
        allowed.add(role);
      }
    }
  }

  return [...allowed];
}

export async function hasAnyLeadRole(userId: string) {
  const leads = await getActiveLeads(userId);
  return leads.length > 0;
}
