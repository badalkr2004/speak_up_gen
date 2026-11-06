import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AssignRoleForm } from "@/app/components/org/assign-role-form";
import { CreateCityForm } from "@/app/components/org/create-city-form";
import { CreateUnitForm } from "@/app/components/org/create-unit-form";
import { requireSession } from "@/lib/auth/session";
import { can, getAssignableRoles } from "@/lib/org/access";
import {
  getOrgUnitById,
  listChildUnits,
  listGeoCities,
  listUnitKinds,
  listUnitMembers,
} from "@/lib/org/queries";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chapter",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

async function OrgDetailContent({ params }: { params: Params }) {
  const session = await requireSession();
  const { id } = await params;
  const unit = await getOrgUnitById(id);
  if (!unit) notFound();

  const canView = await can(session.user.id, "view_org", unit.id);
  if (!canView) {
    redirect("/dashboard/org");
  }

  const children = await listChildUnits(unit.id);
  const canCreateCity =
    unit.level === "state" &&
    (await can(session.user.id, "create_city", unit.id));
  const canCreateUnit =
    unit.level === "city" &&
    (await can(session.user.id, "create_unit", unit.id));
  const canAssign = await can(session.user.id, "assign_roles", unit.id);
  const assignable = canAssign
    ? await getAssignableRoles(session.user.id, unit.id)
    : [];

  const members =
    unit.level === "unit" || unit.level === "city" || unit.level === "state"
      ? await listUnitMembers(unit.id)
      : [];

  const cities =
    unit.level === "state" && unit.stateCode
      ? await listGeoCities(unit.stateCode)
      : [];
  const kinds = unit.level === "city" ? await listUnitKinds() : [];

  return (
    <div className="container-x py-10 sm:py-12">
      <Link
        href={unit.parentId ? `/dashboard/org/${unit.parentId}` : "/dashboard/org"}
        className="text-sm font-semibold text-leaf underline-offset-2 hover:underline"
      >
        ← Back
      </Link>
      <p className="eyebrow mt-6 text-leaf">{unit.level}</p>
      <h1 className="display mt-3 text-[clamp(2rem,6vw,3rem)]">{unit.name}</h1>
      {unit.kindLabel ? (
        <p className="mt-2 text-ink-soft">{unit.kindLabel}</p>
      ) : null}
      <p className="mt-2 text-sm">
        <Link
          href={`/dashboard/people?unit=${unit.id}`}
          className="font-semibold text-leaf underline-offset-2 hover:underline"
        >
          Manage people in this scope →
        </Link>
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="text-lg font-semibold">
            {unit.level === "state"
              ? "Cities"
              : unit.level === "city"
                ? "Local teams"
                : unit.level === "unit"
                  ? "Members"
                  : "Children"}
          </h2>

          {unit.level === "unit" ? (
            <ul className="mt-4 space-y-3">
              {members.length === 0 ? (
                <li className="text-sm text-ink-soft">No active members yet.</li>
              ) : (
                members.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border-2 border-ink/15 bg-paper px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{m.userName}</p>
                        <p className="text-xs text-ink-soft">
                          {m.userEmail}
                          {m.memberCode ? ` · ${m.memberCode}` : ""}
                        </p>
                      </div>
                      {canAssign && assignable.length > 0 ? (
                        <AssignRoleForm
                          userId={m.userId}
                          targetOrgUnitId={unit.id}
                          sourceMembershipId={m.id}
                          currentRole={m.roleKey}
                          allowedRoles={assignable}
                        />
                      ) : (
                        <span className="text-xs uppercase tracking-wide text-ink-soft">
                          {m.roleKey.replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : (
            <>
              <ul className="mt-4 space-y-2">
                {children.length === 0 ? (
                  <li className="text-sm text-ink-soft">Nothing here yet.</li>
                ) : (
                  children.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/dashboard/org/${c.id}`}
                        className="block rounded-xl border-2 border-ink bg-paper px-4 py-3 font-medium hover:bg-lime/30"
                      >
                        {c.name}
                        {c.kindLabel ? (
                          <span className="ml-2 text-xs text-ink-soft">
                            {c.kindLabel}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              {members.length > 0 ? (
                <div className="mt-8">
                  <h3 className="font-semibold">Chapter leads & staff</h3>
                  <ul className="mt-3 space-y-2">
                    {members.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm"
                      >
                        <span>
                          {m.userName}{" "}
                          <span className="text-ink-soft">
                            · {m.roleKey.replaceAll("_", " ")}
                          </span>
                        </span>
                        {canAssign && assignable.length > 0 ? (
                          <AssignRoleForm
                            userId={m.userId}
                            targetOrgUnitId={unit.id}
                            sourceMembershipId={m.id}
                            currentRole={m.roleKey}
                            allowedRoles={assignable}
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </section>

        <aside className="space-y-4">
          {canCreateCity ? (
            <CreateCityForm parentStateUnitId={unit.id} cities={cities} />
          ) : null}
          {canCreateUnit ? (
            <CreateUnitForm
              parentCityUnitId={unit.id}
              kinds={kinds.map((k) => ({ id: k.id, label: k.label }))}
            />
          ) : null}
          {!canCreateCity && !canCreateUnit ? (
            <p className="text-sm text-ink-soft">
              Creating children requires lead access on this chapter. Role
              changes belong on People for correct city/state attachment.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default function OrgDetailPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10 text-ink-soft">Loading chapter…</div>
      }
    >
      <OrgDetailContent params={params} />
    </Suspense>
  );
}
