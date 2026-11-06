/** Client-safe flags only — never put secrets here. */

export function isGoogleAuthConfiguredClient() {
  return process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
}
