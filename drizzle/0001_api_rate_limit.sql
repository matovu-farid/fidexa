CREATE TABLE "api_rate_limit" (
	"key_hash" text NOT NULL,
	"route" text NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"hits" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "api_rate_limit_key_route_window_idx" ON "api_rate_limit" USING btree ("key_hash","route","window_started_at");