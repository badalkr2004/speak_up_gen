import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { getAppUrl, getServerEnv, isGoogleAuthConfigured } from "@/lib/env";

function buildSocialProviders() {
  const env = getServerEnv();
  if (!isGoogleAuthConfigured()) return {};

  return {
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      accessType: "offline" as const,
      prompt: "select_account" as const,
    },
  };
}

/**
 * Better Auth server instance.
 * Email verification is not required yet (no mail provider). Documented gap —
 * enable requireEmailVerification once transactional email is wired.
 */
function authSecret() {
  const secret = getServerEnv().BETTER_AUTH_SECRET;
  if (secret) return secret;

  // `next build` sets NODE_ENV=production without necessarily loading secrets.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "build-time-placeholder-secret-not-for-runtime";
  }

  if (getServerEnv().NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET must be set in production.");
  }

  // Local fallback only — never rely on this outside development.
  return "dev-only-speak-up-gen-auth-secret-change-me";
}

export const auth = betterAuth({
  appName: "Speak Up Gen",
  baseURL: getAppUrl(),
  secret: authSecret(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: buildSocialProviders(),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: getServerEnv().NODE_ENV === "production",
    database: {
      generateId: undefined,
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
