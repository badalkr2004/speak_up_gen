import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __speakUpGenSql?: ReturnType<typeof postgres>;
  __speakUpGenDb?: Db;
};

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example).",
    );
  }
  return url;
}

function createClient() {
  return postgres(requireDatabaseUrl(), {
    max: 10,
    prepare: false,
  });
}

export function getDb(): Db {
  if (!globalForDb.__speakUpGenDb) {
    const client = globalForDb.__speakUpGenSql ?? createClient();
    globalForDb.__speakUpGenSql = client;
    globalForDb.__speakUpGenDb = drizzle(client, { schema });
  }
  return globalForDb.__speakUpGenDb;
}

/** Prefer getDb() in app code. Export for Better Auth / Drizzle Kit ergonomics. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
