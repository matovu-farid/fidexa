ALTER TABLE "campaign_runs" ADD COLUMN "client_request_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_runs_request_unique" ON "campaign_runs" USING btree ("client_request_id");