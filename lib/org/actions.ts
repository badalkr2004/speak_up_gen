"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  assertCanApproveApplication,
  canApproveApplication,
} from "@/lib/auth/permissions";
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
import { ensureNationalUnit, NATIONAL_UNIT_ID } from "@/lib/org/bootstrap";
import { createId, slugify } from "@/lib/org/ids";
import { allocateMemberCode } from "@/lib/org/member-code";
import {
  canAssignLeadOnUnit,
  canManageChildren,
  isNationalAdmin,
} from "@/lib/org/permissions-org";
import {
  applySchema,
  assignLeadSchema,
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

    revalidatePath("/dashboard");
    revalidatePath("/apply");
    revalidatePath("/dashboard/approvals");
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

    await assertCanApproveApplication(reviewer.id, app.targetOrgUnitId);

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

      revalidatePath("/dashboard/approvals");
      revalidatePath("/dashboard");
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

    revalidatePath("/dashboard/approvals");
    revalidatePath("/dashboard");
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
    if (!(await canManageChildren(actor.id, NATIONAL_UNIT_ID))) {
      return { ok: false as const, error: "Not allowed to create state chapters." };
    }

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

    revalidatePath("/dashboard/org");
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

    if (!(await canManageChildren(actor.id, parsed.data.parentStateUnitId))) {
      return { ok: false as const, error: "Not allowed to create city chapters." };
    }

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

    revalidatePath("/dashboard/org");
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

    if (!(await canManageChildren(actor.id, parsed.data.parentCityUnitId))) {
      return { ok: false as const, error: "Not allowed to create local teams." };
    }

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

    revalidatePath("/dashboard/org");
    revalidatePath(`/dashboard/org/${parent.id}`);
    revalidatePath("/apply");
    return { ok: true as const, id };
  } catch (error) {
    return actionError(error);
  }
}

export async function assignLeadAction(raw: unknown) {
  try {
    const actor = await requireUserId();
    const parsed = assignLeadSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid assignment.",
      };
    }

    const db = getDb();
    const [mem] = await db
      .select()
      .from(membership)
      .where(eq(membership.id, parsed.data.membershipId))
      .limit(1);

    if (!mem || mem.status !== "active") {
      return { ok: false as const, error: "Membership not found." };
    }

    if (!(await canAssignLeadOnUnit(actor.id, mem.orgUnitId))) {
      if (!(await isNationalAdmin(actor.id))) {
        return { ok: false as const, error: "Not allowed to change roles here." };
      }
    }

    await db
      .update(membership)
      .set({ roleKey: parsed.data.roleKey, updatedAt: new Date() })
      .where(eq(membership.id, mem.id));

    revalidatePath(`/dashboard/org/${mem.orgUnitId}`);
    revalidatePath("/dashboard");
    return { ok: true as const };
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
      (await canApproveApplication(actor.id, mem.orgUnitId)) ||
      (await isNationalAdmin(actor.id));

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
      // First-run escape: if no national unit exists yet, allow any signed-in user
      // only when explicitly creating national — actually safer: require admin seed CLI.
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
    revalidatePath("/dashboard/org");
    return { ok: true as const };
  } catch (error) {
    return actionError(error);
  }
}
