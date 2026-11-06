import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { geoCity, membership, orgUnit } from "@/lib/db/schema";

/**
 * Member codes: SUG-{STATE}-{CITY}-{SEQ}
 * Example: SUG-MH-MUM-00042
 */
export async function allocateMemberCode(orgUnitId: string): Promise<string> {
  const db = getDb();

  const [unit] = await db
    .select({
      id: orgUnit.id,
      level: orgUnit.level,
      parentId: orgUnit.parentId,
      stateCode: orgUnit.stateCode,
      cityId: orgUnit.cityId,
    })
    .from(orgUnit)
    .where(eq(orgUnit.id, orgUnitId))
    .limit(1);

  if (!unit) {
    throw new Error("Organisation unit not found.");
  }

  let stateCode = unit.stateCode ?? "IN";
  let citySlug = "GEN";

  if (unit.level === "unit" && unit.parentId) {
    const [cityUnit] = await db
      .select({
        stateCode: orgUnit.stateCode,
        cityId: orgUnit.cityId,
      })
      .from(orgUnit)
      .where(eq(orgUnit.id, unit.parentId))
      .limit(1);

    if (cityUnit?.stateCode) stateCode = cityUnit.stateCode;
    if (cityUnit?.cityId) {
      const [city] = await db
        .select({ slug: geoCity.slug })
        .from(geoCity)
        .where(eq(geoCity.id, cityUnit.cityId))
        .limit(1);
      if (city?.slug) citySlug = city.slug;
    }
  } else if (unit.level === "city") {
    if (unit.stateCode) stateCode = unit.stateCode;
    if (unit.cityId) {
      const [city] = await db
        .select({ slug: geoCity.slug })
        .from(geoCity)
        .where(eq(geoCity.id, unit.cityId))
        .limit(1);
      if (city?.slug) citySlug = city.slug;
    }
  }

  const cityPart = citySlug.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "GEN";
  const statePart = stateCode.toUpperCase().slice(0, 3);

  const [{ value: seq }] = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(membership)
    .where(
      and(
        eq(membership.orgUnitId, orgUnitId),
        sql`${membership.memberCode} is not null`,
      ),
    );

  const next = (seq ?? 0) + 1;
  return `SUG-${statePart}-${cityPart}-${String(next).padStart(5, "0")}`;
}
