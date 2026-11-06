import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  application,
  geoCity,
  geoState,
  idCard,
  membership,
  orgUnit,
  unitKind,
  user,
} from "@/lib/db/schema";
import {
  getActiveLeads,
  getScopedOrgRoots,
  hasAnyLeadRole,
  listUnitIdsInScope,
} from "@/lib/org/access";

export async function listUnitKinds() {
  const db = getDb();
  return db
    .select()
    .from(unitKind)
    .where(eq(unitKind.isActive, 1))
    .orderBy(asc(unitKind.label));
}

export async function listGeoStates() {
  const db = getDb();
  return db.select().from(geoState).orderBy(asc(geoState.name));
}

export async function listGeoCities(stateCode: string) {
  const db = getDb();
  return db
    .select()
    .from(geoCity)
    .where(eq(geoCity.stateCode, stateCode))
    .orderBy(asc(geoCity.name));
}

export async function getNationalUnit() {
  const db = getDb();
  const [row] = await db
    .select()
    .from(orgUnit)
    .where(eq(orgUnit.level, "national"))
    .limit(1);
  return row ?? null;
}

export async function listChildUnits(parentId: string) {
  const db = getDb();
  return db
    .select({
      id: orgUnit.id,
      name: orgUnit.name,
      slug: orgUnit.slug,
      level: orgUnit.level,
      status: orgUnit.status,
      stateCode: orgUnit.stateCode,
      cityId: orgUnit.cityId,
      unitKindId: orgUnit.unitKindId,
      parentId: orgUnit.parentId,
      kindLabel: unitKind.label,
    })
    .from(orgUnit)
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .where(and(eq(orgUnit.parentId, parentId), eq(orgUnit.status, "active")))
    .orderBy(asc(orgUnit.name));
}

export async function getOrgUnitById(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: orgUnit.id,
      name: orgUnit.name,
      slug: orgUnit.slug,
      level: orgUnit.level,
      status: orgUnit.status,
      stateCode: orgUnit.stateCode,
      cityId: orgUnit.cityId,
      unitKindId: orgUnit.unitKindId,
      parentId: orgUnit.parentId,
      kindLabel: unitKind.label,
    })
    .from(orgUnit)
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .where(eq(orgUnit.id, id))
    .limit(1);
  return row ?? null;
}

/** Active leaf units in a city — never return national dump. */
export async function listJoinableUnits(filters: {
  cityId: string;
  q?: string;
}) {
  const db = getDb();
  const conditions = [
    eq(orgUnit.level, "unit"),
    eq(orgUnit.status, "active"),
    eq(orgUnit.cityId, filters.cityId),
  ];

  const q = filters.q?.trim();
  if (q) {
    conditions.push(ilike(orgUnit.name, `%${q}%`));
  }

  return db
    .select({
      id: orgUnit.id,
      name: orgUnit.name,
      slug: orgUnit.slug,
      stateCode: orgUnit.stateCode,
      parentId: orgUnit.parentId,
      kindLabel: unitKind.label,
      cityName: geoCity.name,
      stateName: geoState.name,
    })
    .from(orgUnit)
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .leftJoin(geoCity, eq(orgUnit.cityId, geoCity.id))
    .leftJoin(geoState, eq(orgUnit.stateCode, geoState.code))
    .where(and(...conditions))
    .orderBy(asc(orgUnit.name))
    .limit(50);
}

/** Cities that already have an active city chapter (for apply pickers). */
export async function listCitiesWithChapters(stateCode: string) {
  const db = getDb();
  return db
    .select({
      cityId: geoCity.id,
      cityName: geoCity.name,
      slug: geoCity.slug,
      chapterId: orgUnit.id,
      chapterName: orgUnit.name,
    })
    .from(orgUnit)
    .innerJoin(geoCity, eq(orgUnit.cityId, geoCity.id))
    .where(
      and(
        eq(orgUnit.level, "city"),
        eq(orgUnit.status, "active"),
        eq(orgUnit.stateCode, stateCode),
      ),
    )
    .orderBy(asc(geoCity.name));
}

/** States that have an active state chapter. */
export async function listStatesWithChapters() {
  const db = getDb();
  return db
    .select({
      stateCode: geoState.code,
      stateName: geoState.name,
      chapterId: orgUnit.id,
      chapterName: orgUnit.name,
    })
    .from(orgUnit)
    .innerJoin(geoState, eq(orgUnit.stateCode, geoState.code))
    .where(and(eq(orgUnit.level, "state"), eq(orgUnit.status, "active")))
    .orderBy(asc(geoState.name));
}

export async function getUserMemberships(userId: string) {
  const db = getDb();
  return db
    .select({
      id: membership.id,
      status: membership.status,
      roleKey: membership.roleKey,
      memberCode: membership.memberCode,
      photoUrl: membership.photoUrl,
      orgUnitId: membership.orgUnitId,
      unitName: orgUnit.name,
      unitLevel: orgUnit.level,
      kindLabel: unitKind.label,
    })
    .from(membership)
    .innerJoin(orgUnit, eq(membership.orgUnitId, orgUnit.id))
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .where(eq(membership.userId, userId))
    .orderBy(desc(membership.createdAt));
}

export async function getUserApplications(userId: string) {
  const db = getDb();
  return db
    .select({
      id: application.id,
      status: application.status,
      fullName: application.fullName,
      createdAt: application.createdAt,
      reviewNote: application.reviewNote,
      unitName: orgUnit.name,
      unitId: orgUnit.id,
    })
    .from(application)
    .innerJoin(orgUnit, eq(application.targetOrgUnitId, orgUnit.id))
    .where(eq(application.userId, userId))
    .orderBy(desc(application.createdAt));
}

export async function listPendingApplicationsForLead(userId: string) {
  const allowedIds = await listUnitIdsInScope(userId);
  if (allowedIds.length === 0) return [];

  const db = getDb();
  return db
    .select({
      id: application.id,
      status: application.status,
      fullName: application.fullName,
      phone: application.phone,
      motivation: application.motivation,
      photoUrl: application.photoUrl,
      createdAt: application.createdAt,
      unitId: orgUnit.id,
      unitName: orgUnit.name,
      applicantEmail: user.email,
      applicantName: user.name,
    })
    .from(application)
    .innerJoin(orgUnit, eq(application.targetOrgUnitId, orgUnit.id))
    .innerJoin(user, eq(application.userId, user.id))
    .where(
      and(
        eq(application.status, "pending"),
        inArray(application.targetOrgUnitId, allowedIds),
      ),
    )
    .orderBy(asc(application.createdAt));
}

/** People directory within actor scope. */
export async function listPeopleInScope(
  userId: string,
  opts: { q?: string; limit?: number } = {},
) {
  const unitIds = await listUnitIdsInScope(userId);
  const { roots, isNationalAdmin: nat } = await getScopedOrgRoots(userId);
  const db = getDb();

  // Include chapter-level memberships (city/state/national leads) in scope
  const chapterIds: string[] = [];
  if (nat) {
    const allChapters = await db
      .select({ id: orgUnit.id })
      .from(orgUnit)
      .where(
        and(
          inArray(orgUnit.level, ["national", "state", "city"]),
          eq(orgUnit.status, "active"),
        ),
      );
    chapterIds.push(...allChapters.map((c) => c.id));
  } else {
    for (const root of roots) {
      chapterIds.push(root.id);
      if (root.level === "state") {
        const cities = await db
          .select({ id: orgUnit.id })
          .from(orgUnit)
          .where(
            and(eq(orgUnit.parentId, root.id), eq(orgUnit.level, "city")),
          );
        chapterIds.push(...cities.map((c) => c.id));
      }
    }
  }

  const scopeIds = [...new Set([...unitIds, ...chapterIds])];
  if (scopeIds.length === 0) return [];

  const conditions = [
    inArray(membership.orgUnitId, scopeIds),
    eq(membership.status, "active"),
  ];

  const q = opts.q?.trim();
  if (q) {
    conditions.push(
      or(ilike(user.name, `%${q}%`), ilike(user.email, `%${q}%`))!,
    );
  }

  return db
    .select({
      membershipId: membership.id,
      roleKey: membership.roleKey,
      memberCode: membership.memberCode,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      orgUnitId: orgUnit.id,
      orgUnitName: orgUnit.name,
      orgUnitLevel: orgUnit.level,
      kindLabel: unitKind.label,
      parentId: orgUnit.parentId,
      stateCode: orgUnit.stateCode,
    })
    .from(membership)
    .innerJoin(user, eq(membership.userId, user.id))
    .innerJoin(orgUnit, eq(membership.orgUnitId, orgUnit.id))
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .where(and(...conditions))
    .orderBy(asc(user.name))
    .limit(opts.limit ?? 100);
}

export async function listUnitMembers(orgUnitId: string) {
  const db = getDb();
  return db
    .select({
      id: membership.id,
      status: membership.status,
      roleKey: membership.roleKey,
      memberCode: membership.memberCode,
      photoUrl: membership.photoUrl,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
    })
    .from(membership)
    .innerJoin(user, eq(membership.userId, user.id))
    .where(
      and(eq(membership.orgUnitId, orgUnitId), eq(membership.status, "active")),
    )
    .orderBy(asc(user.name));
}

export async function getMembershipCardContext(membershipId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      membershipId: membership.id,
      memberCode: membership.memberCode,
      roleKey: membership.roleKey,
      status: membership.status,
      photoUrl: membership.photoUrl,
      userName: user.name,
      userImage: user.image,
      userId: user.id,
      unitName: orgUnit.name,
      unitId: orgUnit.id,
      stateCode: orgUnit.stateCode,
      kindLabel: unitKind.label,
    })
    .from(membership)
    .innerJoin(user, eq(membership.userId, user.id))
    .innerJoin(orgUnit, eq(membership.orgUnitId, orgUnit.id))
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .where(eq(membership.id, membershipId))
    .limit(1);
  return row ?? null;
}

export async function getPublicMemberByCode(memberCode: string) {
  const db = getDb();
  const [row] = await db
    .select({
      memberCode: membership.memberCode,
      roleKey: membership.roleKey,
      status: membership.status,
      photoUrl: membership.photoUrl,
      userName: user.name,
      unitName: orgUnit.name,
      kindLabel: unitKind.label,
      stateCode: orgUnit.stateCode,
    })
    .from(membership)
    .innerJoin(user, eq(membership.userId, user.id))
    .innerJoin(orgUnit, eq(membership.orgUnitId, orgUnit.id))
    .leftJoin(unitKind, eq(orgUnit.unitKindId, unitKind.id))
    .where(eq(membership.memberCode, memberCode))
    .limit(1);

  if (!row || row.status !== "active") return null;

  // Public verify: no email/phone
  return {
    memberCode: row.memberCode!,
    name: row.userName,
    role: row.roleKey,
    status: row.status,
    photoUrl: row.photoUrl,
    unitName: row.unitName,
    kindLabel: row.kindLabel,
    stateCode: row.stateCode,
  };
}

export async function getLatestIdCard(membershipId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(idCard)
    .where(eq(idCard.membershipId, membershipId))
    .orderBy(desc(idCard.version))
    .limit(1);
  return row ?? null;
}

export async function dashboardSummary(userId: string) {
  const [memberships, applications, leads, scoped, pending] = await Promise.all(
    [
      getUserMemberships(userId),
      getUserApplications(userId),
      getActiveLeads(userId),
      getScopedOrgRoots(userId),
      listPendingApplicationsForLead(userId).catch(() => []),
    ],
  );
  return {
    memberships,
    applications,
    isLead: await hasAnyLeadRole(userId),
    isNationalAdmin: scoped.isNationalAdmin,
    scopeRoots: scoped.roots,
    leads,
    pendingCount: pending.length,
  };
}
