import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerConfig } from "@/lib/config";
import * as schema from "./schema";

const sql = postgres(getServerConfig().databaseUrl, { prepare: false, max: 5 });

export const db = drizzle(sql, { schema });
