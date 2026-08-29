import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerConfig } from "@/lib/config";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  client ??= postgres(getServerConfig().databaseUrl, { prepare: false, max: 5 });
  return drizzle(client, { schema });
}
