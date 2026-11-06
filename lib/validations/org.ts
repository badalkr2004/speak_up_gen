import { z } from "zod";

export const applySchema = z.object({
  targetOrgUnitId: z.string().min(1, "Pick a local team"),
  fullName: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  motivation: z.string().trim().max(1000).optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const reviewApplicationSchema = z.object({
  applicationId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  reviewNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export const createStateSchema = z.object({
  stateCode: z.string().trim().min(2).max(3),
  name: z.string().trim().min(2).max(80).optional(),
});

export const createCitySchema = z.object({
  parentStateUnitId: z.string().min(1),
  cityId: z.string().min(1),
  name: z.string().trim().min(2).max(80).optional(),
});

export const createUnitSchema = z.object({
  parentCityUnitId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  unitKindId: z.string().min(1),
});

export const assignLeadSchema = z.object({
  membershipId: z.string().min(1),
  roleKey: z.enum([
    "national_admin",
    "state_lead",
    "city_lead",
    "unit_lead",
    "member",
    "volunteer",
  ]),
});

export const assignRoleSchema = z.object({
  userId: z.string().min(1),
  targetOrgUnitId: z.string().min(1),
  roleKey: z.enum([
    "national_admin",
    "state_lead",
    "city_lead",
    "unit_lead",
    "member",
    "volunteer",
  ]),
  sourceMembershipId: z.string().min(1).optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;
