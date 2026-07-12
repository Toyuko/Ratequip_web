import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hasDatabase } from "@/lib/config";
import * as schema from "./schema";

export function getDb() {
  if (!hasDatabase()) {
    return null;
  }
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
