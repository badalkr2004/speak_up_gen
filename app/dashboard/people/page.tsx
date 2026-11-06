import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AssignRoleForm } from "@/app/components/org/assign-role-form";
import { PromoteLeadForm } from "@/app/components/org/promote-lead-form";
import { PromoteQuickButton } from "@/app/components/org/promote-quick-button";
import type { RoleKey } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import {
  can,
  getAssignableRoles,
  getOrgNode,
  getScopedOrgRoots,
  requiredLevelForRole,
} from "@/lib/org/access";
import { listChildUnits, listPeopleInScope } from "@/lib/org/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "People",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ q?: string; unit?: string }>;

async function PeopleContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const scoped = await getScopedOrgRoots(session.user.id);

  if (scoped.leads.length === 0) {
    redirect("/dashboard");
  }

  const q = params.q?.trim() ?? "";
  const people = await listPeopleInScope(session.user.id, { q, limit: 100 });

  const promoteTargets: {
    id: string;
    name: string;
    level: string;
    roles: RoleKey[];
  }[] = [];

  for (const root of scoped.roots) {
    const roles = await getAssignableRoles(session.user.id, root.id);
    const leadRoles = roles.filter((r) =>
      ["state_lead", "city_lead", "national_admin"].includes(r),
    );
    if (leadRoles.length > 0) {
      promoteTargets.push({
        id: root.id,
        name: root.name,
        level: root.level,
        roles: leadRoles,
      });
    }

    if (root.level === "state" || root.level === "national") {
      const children = await listChildUnits(root.id);
      for (const child of children) {
        if (child.level !== "state" && child.level !== "city") continue;
        const childRoles = await getAssignableRoles(session.user.id, child.id);
        const childLeadRoles = childRoles.filter((r) =>
          ["state_lead", "city_lead"].includes(r),
        );
        if (childLeadRoles.length > 0) {
          promoteTargets.push({
            id: child.id,
            name: child.name,
            level: child.level,
            roles: childLeadRoles,
          });
        }
        if (child.level === "state") {
          const cities = await listChildUnits(child.id);
          for (const city of cities) {
            const cityRoles = await getAssignableRoles(
              session.user.id,
              city.id,
            );
            const cityLeadRoles = cityRoles.filter((r) => r === "city_lead");
            if (cityLeadRoles.length > 0) {
              promoteTargets.push({
                id: city.id,
                name: city.name,
                level: city.level,
                roles: cityLeadRoles,
              });
            }
          }
        }
      }
    }
  }

  return (
    <div className="container-x py-10 sm:py-12">
      <p className="eyebrow text-leaf">Access control</p>
      <h1 className="display mt-3 text-[clamp(2rem,6vw,3rem)]">People</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Search members in your territory. Promoting to city or state lead
        attaches the role on that chapter — not on a local team.
      </p>

      <form className="mt-8 flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="min-w-[16rem] flex-1 rounded-xl border-2 border-ink bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-leaf"
        />
        <button type="submit" className="btn btn-ink !py-2.5 text-sm">
          Search
        </button>
      </form>

      {promoteTargets.length > 0 ? (
        <section className="mt-10 rounded-[1.25rem] border-2 border-ink bg-sky/35 p-5">
          <h2 className="font-semibold">Promote to chapter lead</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Creates or updates membership on the chapter node (enterprise
            attachment rule).
          </p>
          <div className="mt-4">
            <PromoteLeadForm
              targets={promoteTargets}
              candidates={people.map((p) => ({
                userId: p.userId,
                name: p.userName,
                email: p.userEmail,
                membershipId: p.membershipId,
              }))}
            />
          </div>
        </section>
      ) : null}

      <ul className="mt-10 space-y-3">
        {people.length === 0 ? (
          <li className="rounded-xl border-2 border-ink/15 bg-paper-2 p-5 text-sm text-ink-soft">
            No people in your scope{q ? " matching that search" : ""}.
          </li>
        ) : (
          await Promise.all(
            people.map(async (p) => {
              const canAssign = await can(
                session.user.id,
                "assign_roles",
                p.orgUnitId,
              );
              const allowed = canAssign
                ? (
                    await getAssignableRoles(session.user.id, p.orgUnitId)
                  ).filter((r) => requiredLevelForRole(r) === p.orgUnitLevel)
                : [];

              let parentPromote: { id: string; roles: RoleKey[] } | null = null;
              if (p.orgUnitLevel === "unit" && p.parentId) {
                const parent = await getOrgNode(p.parentId);
                if (parent) {
                  const parentRoles = await getAssignableRoles(
                    session.user.id,
                    parent.id,
                  );
                  const leadRoles = parentRoles.filter((r) =>
                    ["city_lead", "state_lead"].includes(r),
                  );
                  if (leadRoles.length > 0) {
                    parentPromote = { id: parent.id, roles: leadRoles };
                  }
                }
              }

              return (
                <li
                  key={`${p.membershipId}-${p.orgUnitId}`}
                  className="rounded-[1.25rem] border-2 border-ink bg-paper px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{p.userName}</p>
                      <p className="text-sm text-ink-soft">{p.userEmail}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {p.orgUnitName} · {p.orgUnitLevel}
                        {p.kindLabel ? ` · ${p.kindLabel}` : ""} ·{" "}
                        {p.roleKey.replaceAll("_", " ")}
                        {p.memberCode ? ` · ${p.memberCode}` : ""}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {allowed.length > 0 ? (
                        <AssignRoleForm
                          userId={p.userId}
                          targetOrgUnitId={p.orgUnitId}
                          sourceMembershipId={p.membershipId}
                          currentRole={p.roleKey}
                          allowedRoles={allowed}
                        />
                      ) : null}
                      {parentPromote ? (
                        <div className="flex flex-wrap gap-2">
                          {parentPromote.roles.map((role) => (
                            <PromoteQuickButton
                              key={role}
                              userId={p.userId}
                              targetOrgUnitId={parentPromote!.id}
                              sourceMembershipId={p.membershipId}
                              roleKey={role}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            }),
          )
        )}
      </ul>

      <p className="mt-8 text-sm">
        <Link
          href="/dashboard/org"
          className="font-semibold text-leaf underline-offset-2 hover:underline"
        >
          ← Organisation
        </Link>
      </p>
    </div>
  );
}

export default function PeoplePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <div className="container-x py-10 text-ink-soft">Loading people…</div>
      }
    >
      <PeopleContent searchParams={searchParams} />
    </Suspense>
  );
}
