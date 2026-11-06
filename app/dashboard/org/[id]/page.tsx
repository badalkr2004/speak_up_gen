import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AssignRoleForm } from "@/app/components/org/assign-role-form";
import { CreateCityForm } from "@/app/components/org/create-city-form";
import { CreateUnitForm } from "@/app/components/org/create-unit-form";
import { requireSession } from "@/lib/auth/session";
import { canAssignLeadOnUnit, canManageChildren } from "@/lib/org/permissions-org";
import {
  getOrgUnitById,
  listChildUnits,
  listGeoCities,
  listUnitKinds,
  listUnitMembers,
} from "@/lib/org/queries";
import { notFound } from "next/navigation";

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

  const children = await listChildUnits(unit.id);
  const canManage = await canManageChildren(session.user.id, unit.id);
  const canAssign = await canAssignLeadOnUnit(session.user.id, unit.id);
  const members =
    unit.level === "unit" ? await listUnitMembers(unit.id) : [];

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
                      {canAssign ? (
                        <AssignRoleForm
                          membershipId={m.id}
                          currentRole={m.roleKey}
                        />
                      ) : (
                        <span className="text-xs uppercase tracking-wide text-ink-soft">
                          {m.roleKey.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          ) : (
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
          )}
        </section>

        <aside className="space-y-4">
          {canManage && unit.level === "state" ? (
            <CreateCityForm parentStateUnitId={unit.id} cities={cities} />
          ) : null}
          {canManage && unit.level === "city" ? (
            <CreateUnitForm
              parentCityUnitId={unit.id}
              kinds={kinds.map((k) => ({ id: k.id, label: k.label }))}
            />
          ) : null}
          {!canManage ? (
            <p className="text-sm text-ink-soft">
              You can view this chapter. Creating children requires lead access
              on the parent level.
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
