import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/** National → State → City → Unit (pluggable kinds at the leaf). */
export const orgUnitLevelEnum = pgEnum("org_unit_level", [
  "national",
  "state",
  "city",
  "unit",
]);

export const orgUnitStatusEnum = pgEnum("org_unit_status", [
  "active",
  "pending",
  "archived",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "pending",
  "active",
  "rejected",
  "suspended",
  "alumni",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
]);

export const roleKeyEnum = pgEnum("role_key", [
  "national_admin",
  "state_lead",
  "city_lead",
  "unit_lead",
  "member",
  "volunteer",
]);

/** Extensible labels for leaf units (campus, community, workplace, …). */
export const unitKind = pgTable("unit_kind", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const geoState = pgTable("geo_state", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});

export const geoCity = pgTable(
  "geo_city",
  {
    id: text("id").primaryKey(),
    stateCode: text("state_code")
      .notNull()
      .references(() => geoState.code),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [uniqueIndex("geo_city_state_slug_uidx").on(t.stateCode, t.slug)],
);

export const orgUnit = pgTable(
  "org_unit",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id"),
    level: orgUnitLevelEnum("level").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: orgUnitStatusEnum("status").notNull().default("active"),
    stateCode: text("state_code").references(() => geoState.code),
    cityId: text("city_id").references(() => geoCity.id),
    unitKindId: text("unit_kind_id").references(() => unitKind.id),
    createdByUserId: text("created_by_user_id").references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("org_unit_slug_uidx").on(t.slug)],
);

export const membership = pgTable(
  "membership",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orgUnitId: text("org_unit_id")
      .notNull()
      .references(() => orgUnit.id, { onDelete: "cascade" }),
    roleKey: roleKeyEnum("role_key").notNull().default("member"),
    status: membershipStatusEnum("status").notNull().default("pending"),
    memberCode: text("member_code").unique(),
    photoUrl: text("photo_url"),
    approvedByUserId: text("approved_by_user_id").references(() => user.id),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("membership_user_unit_uidx").on(t.userId, t.orgUnitId),
  ],
);

export const application = pgTable("application", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetOrgUnitId: text("target_org_unit_id")
    .notNull()
    .references(() => orgUnit.id, { onDelete: "cascade" }),
  status: applicationStatusEnum("status").notNull().default("pending"),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  motivation: text("motivation"),
  photoUrl: text("photo_url"),
  reviewedByUserId: text("reviewed_by_user_id").references(() => user.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const idCard = pgTable("id_card", {
  id: text("id").primaryKey(),
  membershipId: text("membership_id")
    .notNull()
    .references(() => membership.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  assetUrl: text("asset_url"),
  qrPayload: text("qr_payload").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
