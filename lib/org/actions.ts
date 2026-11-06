"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { RoleKey } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import {
  application,
  geoCity,
  geoState,
  idCard,
  membership,
  orgUnit,
} from "@/lib/db/schema";
import { getAppUrl } from "@/lib/env";
import {
  assertCan,
  can,
  getAssignableRoles,
  getOrgNode,
  isNationalAdmin,
  requiredLevelForRole,
} from "@/lib/org/access";
import { ensureNationalUnit, NATIONAL_UNIT_ID } from "@/lib/org/bootstrap";
import { createId, slugify } from "@/lib/org/ids";
import { allocateMemberCode } from "@/lib/org/member-code";
import {
  applySchema,
  assignRoleSchema,
  createCitySchema,
  createStateSchema,
  createUnitSchema,
  reviewApplicationSchema,
} from "@/lib/validations/org";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }
  return session.user;
}

function actionError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  return { ok: false as const, error: message };
}

function revalidateOrg() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/org");
  revalidatePath("/dashboard/people");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/apply");
}

export async function submitApplicationAction(raw: unknown) {
  try {
    const user = await requireUserId();
    const parsed = applySchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid application.",
      };
    }

    const data = parsed.data;
    const db = getDb();

    const [target] = await db
      .select()
      .from(orgUnit)
      .where(
        and(eq(orgUnit.id, data.targetOrgUnitId), eq(orgUnit.level, "unit")),
      )
      .limit(1);

    if (!target || target.status !== "active") {
      return { ok: false as const, error: "That local team is not available." };
    }

    const [pending] = await db
      .select()
      .from(application)
      .where(
        and(
          eq(application.userId, user.id),
          eq(application.targetOrgUnitId, target.id),
          eq(application.status, "pending"),
        ),
      )
      .limit(1);

    if (pending) {
      return {
        ok: false as const,
        error: "You already have a pending application for this team.",
      };
    }

    const [active] = await db
      .select()
      .from(membership)
      .where(
        and(
          eq(membership.userId, user.id),
          eq(membership.orgUnitId, target.id),
          eq(membership.status, "active"),
        ),
      )
      .limit(1);

    if (active) {
      return { ok: false as const, error: "You are already a member of this team." };
    }

    const id = createId("app");
    await db.insert(application).values({
      id,
      userId: user.id,
      targetOrgUnitId: target.id,
      status: "pending",
      fullName: data.fullName,
      phone: data.phone || null,
      motivation: data.motivation || null,
      photoUrl: data.photoUrl || null,
    });

    revalidateOrg();
    return { ok: true as const, applicationId: id };
  } catch (error) {
    return actionError(error);
  }
}

export async function reviewApplicationAction(raw: unknown) {
  try {
    const reviewer = await requireUserId();
    const parsed = reviewApplicationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid review.",
      };
    }

    const db = getDb();
    const [app] = await db
      .select()
      .from(application)
      .where(eq(application.id, parsed.data.applicationId))
      .limit(1);

    if (!app || app.status !== "pending") {
      return { ok: false as const, error: "Application not found or already reviewed." };
    }

    await assertCan(reviewer.id, "approve_application", app.targetOrgUnitId);

    if (parsed.data.decision === "rejected") {
      await db
        .update(application)
        .set({
          status: "rejected",
          reviewedByUserId: reviewer.id,
          reviewedAt: new Date(),
          reviewNote: parsed.data.reviewNote || null,
          updatedAt: new Date(),
        })
        .where(eq(application.id, app.id));

      revalidateOrg();
      return { ok: true as const };
    }

    const memberCode = await allocateMemberCode(app.targetOrgUnitId);
    const membershipId = createId("mem");

    await db.insert(membership).values({
      id: membershipId,
      userId: app.userId,
      orgUnitId: app.targetOrgUnitId,
      roleKey: "member",
      status: "active",
      memberCode,
      photoUrl: app.photoUrl,
      approvedByUserId: reviewer.id,
      approvedAt: new Date(),
    });

    await db
      .update(application)
      .set({
        status: "approved",
        reviewedByUserId: reviewer.id,
        reviewedAt: new Date(),
        reviewNote: parsed.data.reviewNote || null,
        updatedAt: new Date(),
      })
      .where(eq(application.id, app.id));

    const qrPayload = `${getAppUrl()}/verify/${memberCode}`;
    await db.insert(idCard).values({
      id: createId("card"),
      membershipId,
      version: 1,
      qrPayload,
    });

    revalidateOrg();
    revalidatePath(`/verify/${memberCode}`);
    return { ok: true as const, memberCode, membershipId };
  } catch (error) {
    return actionError(error);
  }
}

export async function createStateChapterAction(raw: unknown) {
  try {
    const actor = await requireUserId();
    const parsed = createStateSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid state.",
      };
    }

    await ensureNationalUnit(actor.id);
    await assertCan(actor.id, "create_state", NATIONAL_UNIT_ID);

    const db = getDb();
    const code = parsed.data.stateCode.toUpperCase();
    const [geo] = await db
      .select()
      .from(geoState)
      .where(eq(geoState.code, code))
      .limit(1);

    if (!geo) {
      return { ok: false as const, error: "Unknown state code." };
    }

    const name = parsed.data.name?.trim() || `${geo.name} Chapter`;
    const slug = slugify(`state-${code}`);
    const id = createId("ou");

    await db.insert(orgUnit).values({
      id,
      parentId: NATIONAL_UNIT_ID,
      level: "state",
      name,
      slug,
      status: "active",
      stateCode: code,
      createdByUserId: actor.id,
    });

    revalidateOrg();
    return { ok: true as const, id };
  } catch (error) {
    return actionError(error);
  }
}

export async function createCityChapterAction(raw: unknown) {
  try {
    const actor = await requireUserId();
    const parsed = createCitySchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid city.",
      };
    }

    await assertCan(actor.id, "create_city", parsed.data.parentStateUnitId);

    const db = getDb();
    const [parent] = await db
      .select()
      .from(orgUnit)
      .where(
        and(
          eq(orgUnit.id, parsed.data.parentStateUnitId),
          eq(orgUnit.level, "state"),
        ),
      )
      .limit(1);

    if (!parent) {
      return { ok: false as const, error: "State chapter not found." };
    }

    const [city] = await db
      .select()
      .from(geoCity)
      .where(eq(geoCity.id, parsed.data.cityId))
      .limit(1);

    if (!city || city.stateCode !== parent.stateCode) {
      return { ok: false as const, error: "City does not belong to this state." };
    }

    const name = parsed.data.name?.trim() || `${city.name} Chapter`;
    const slug = slugify(`city-${city.stateCode}-${city.slug}`);
    const id = createId("ou");

    await db.insert(orgUnit).values({
      id,
      parentId: parent.id,
      level: "city",
      name,
      slug,
      status: "active",
      stateCode: city.stateCode,
      cityId: city.id,
      createdByUserId: actor.id,
    });

    revalidateOrg();
    revalidatePath(`/dashboard/org/${parent.id}`);
    return { ok: true as const, id };
  } catch (error) {
    return actionError(error);
  }
}

export async function createLocalUnitAction(raw: unknown) {
  try {
    const actor = await requireUserId();
    const parsed = createUnitSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid team.",
      };
    }

    await assertCan(actor.id, "create_unit", parsed.data.parentCityUnitId);

    const db = getDb();
    const [parent] = await db
      .select()
      .from(orgUnit)
      .where(
        and(
          eq(orgUnit.id, parsed.data.parentCityUnitId),
          eq(orgUnit.level, "city"),
        ),
      )
      .limit(1);

    if (!parent) {
      return { ok: false as const, error: "City chapter not found." };
    }

    const id = createId("ou");
    const slug = slugify(
      `unit-${parent.stateCode ?? "in"}-${parsed.data.name}-${id.slice(-6)}`,
    );

    await db.insert(orgUnit).values({
      id,
      parentId: parent.id,
      level: "unit",
      name: parsed.data.name.trim(),
      slug,
      status: "active",
      stateCode: parent.stateCode,
      cityId: parent.cityId,
      unitKindId: parsed.data.unitKindId,
      createdByUserId: actor.id,
    });

    revalidateOrg();
    revalidatePath(`/dashboard/org/${parent.id}`);
    return { ok: true as const, id };
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Assign a role on the correct org node.
 * City/state lead roles create/update membership on the chapter — never flip a unit membership to city_lead.
 */
export async function assignRoleAction(raw: unknown) {
  try {
    const actor = await requireUserId();
    const parsed = assignRoleSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid assignment.",
      };
    }

    const roleKey = parsed.data.roleKey as RoleKey;
    const targetOrgUnitId = parsed.data.targetOrgUnitId;
    const targetUserId = parsed.data.userId;

    const target = await getOrgNode(targetOrgUnitId);
    if (!target || target.status !== "active") {
      return { ok: false as const, error: "Organisation unit not found." };
    }

    if (requiredLevelForRole(roleKey) !== target.level) {
      return {
        ok: false as const,
        error: `${roleKey} must be assigned on a ${requiredLevelForRole(roleKey)} chapter.`,
      };
    }

    await assertCan(actor.id, "assign_roles", targetOrgUnitId);

    const allowed = await getAssignableRoles(actor.id, targetOrgUnitId);
    if (!allowed.includes(roleKey)) {
      return {
        ok: false as const,
        error: "You cannot assign that role at this level.",
      };
    }

    const db = getDb();

    const [existing] = await db
      .select()
      .from(membership)
      .where(
        and(
          eq(membership.userId, targetUserId),
          eq(membership.orgUnitId, targetOrgUnitId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(membership)
        .set({
          roleKey,
          status: "active",
          updatedAt: new Date(),
          approvedAt: existing.approvedAt ?? new Date(),
          approvedByUserId: existing.approvedByUserId ?? actor.id,
        })
        .where(eq(membership.id, existing.id));
    } else {
      await db.insert(membership).values({
        id: createId("mem"),
        userId: targetUserId,
        orgUnitId: targetOrgUnitId,
        roleKey,
        status: "active",
        approvedAt: new Date(),
        approvedByUserId: actor.id,
      });
    }

    // If elevating to city/state lead from a unit membership, keep unit as member
    if (
      (roleKey === "city_lead" || roleKey === "state_lead") &&
      parsed.data.sourceMembershipId
    ) {
      const [source] = await db
        .select()
        .from(membership)
        .where(eq(membership.id, parsed.data.sourceMembershipId))
        .limit(1);

      if (
        source &&
        source.userId === targetUserId &&
        source.orgUnitId !== targetOrgUnitId
      ) {
        const sourceUnit = await getOrgNode(source.orgUnitId);
        if (sourceUnit?.level === "unit") {
          await db
            .update(membership)
            .set({ roleKey: "member", updatedAt: new Date() })
            .where(eq(membership.id, source.id));
        }
      }
    }

    revalidateOrg();
    revalidatePath(`/dashboard/org/${targetOrgUnitId}`);
    return { ok: true as const };
  } catch (error) {
    return actionError(error);
  }
}

/** @deprecated Use assignRoleAction — kept for older forms during migration */
export async function assignLeadAction(raw: unknown) {
  try {
    const actor = await requireUserId();
    const data = raw as {
      membershipId?: string;
      roleKey?: string;
    };

    if (!data.membershipId || !data.roleKey) {
      return { ok: false as const, error: "Invalid assignment." };
    }

    const db = getDb();
    const [mem] = await db
      .select()
      .from(membership)
      .where(eq(membership.id, data.membershipId))
      .limit(1);

    if (!mem) {
      return { ok: false as const, error: "Membership not found." };
    }

    const roleKey = data.roleKey as RoleKey;
    const neededLevel = requiredLevelForRole(roleKey);
    let targetOrgUnitId = mem.orgUnitId;

    if (neededLevel !== "unit") {
      // Walk up to the correct chapter
      let node = await getOrgNode(mem.orgUnitId);
      while (node && node.level !== neededLevel) {
        if (!node.parentId) break;
        node = await getOrgNode(node.parentId);
      }
      if (!node || node.level !== neededLevel) {
        return {
          ok: false as const,
          error: `Could not find ${neededLevel} chapter for this member.`,
        };
      }
      targetOrgUnitId = node.id;
    }

    return assignRoleAction({
      userId: mem.userId,
      targetOrgUnitId,
      roleKey,
      sourceMembershipId: mem.id,
    });
  } catch (error) {
    return actionError(error);
  }
}

export async function issueIdCardAction(membershipId: string) {
  try {
    const actor = await requireUserId();
    const db = getDb();
    const [mem] = await db
      .select()
      .from(membership)
      .where(eq(membership.id, membershipId))
      .limit(1);

    if (!mem || mem.status !== "active" || !mem.memberCode) {
      return { ok: false as const, error: "Active membership with code required." };
    }

    const allowed =
      mem.userId === actor.id ||
      (await can(actor.id, "issue_id_card", mem.orgUnitId));

    if (!allowed) {
      return { ok: false as const, error: "Not allowed to issue this ID card." };
    }

    const existing = await db
      .select()
      .from(idCard)
      .where(eq(idCard.membershipId, mem.id));

    const version = existing.length + 1;
    const qrPayload = `${getAppUrl()}/verify/${mem.memberCode}`;
    const id = createId("card");

    await db.insert(idCard).values({
      id,
      membershipId: mem.id,
      version,
      qrPayload,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/id-card/${mem.id}`);
    return { ok: true as const, id, version, memberCode: mem.memberCode };
  } catch (error) {
    return actionError(error);
  }
}

export async function bootstrapOrgAction() {
  try {
    const actor = await requireUserId();
    if (!(await isNationalAdmin(actor.id))) {
      const db = getDb();
      const [national] = await db
        .select()
        .from(orgUnit)
        .where(eq(orgUnit.level, "national"))
        .limit(1);
      if (national) {
        return { ok: false as const, error: "Only national admins can bootstrap." };
      }
    }
    await ensureNationalUnit(actor.id);
    revalidateOrg();
    return { ok: true as const };
  } catch (error) {
    return actionError(error);
  }
}
