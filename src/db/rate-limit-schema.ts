import { integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const apiRateLimit = pgTable("api_rate_limit", {
  keyHash: text("key_hash").notNull(),
  route: text("route").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
  hits: integer("hits").notNull().default(1),
}, (table) => [
  uniqueIndex("api_rate_limit_key_route_window_idx").on(table.keyHash, table.route, table.windowStartedAt),
]);
