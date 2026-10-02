CREATE TABLE "campaign_learning_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"hypothesis" text NOT NULL,
	"action" text NOT NULL,
	"expected_metric" text NOT NULL,
	"comparable_signals" integer NOT NULL,
	"relevant_records" integer NOT NULL,
	"risk" text NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"result" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_learning_actions_risk_check" CHECK ("campaign_learning_actions"."risk" IN ('low', 'high')),
	CONSTRAINT "campaign_learning_actions_status_check" CHECK ("campaign_learning_actions"."status" IN ('proposed', 'applied', 'needs_user_decision', 'rejected', 'evaluated')),
	CONSTRAINT "campaign_learning_actions_apply_gate" CHECK ("campaign_learning_actions"."status" <> 'applied' OR ("campaign_learning_actions"."risk" = 'low' AND ("campaign_learning_actions"."comparable_signals" >= 3 OR "campaign_learning_actions"."relevant_records" >= 10)))
);
--> statement-breakpoint
CREATE TABLE "campaign_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"event_type" text NOT NULL,
	"source" text DEFAULT 'manual_zoho_browser' NOT NULL,
	"outcome" text NOT NULL,
	"attribution" text DEFAULT 'unknown' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"checked_folders" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visible_message_id" text,
	"variant_id" text,
	"note" text,
	"client_request_id" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_observations_source_check" CHECK ("campaign_observations"."source" = 'manual_zoho_browser'),
	CONSTRAINT "campaign_observations_event_type_check" CHECK ("campaign_observations"."event_type" IN ('sent', 'delivered', 'bounce', 'reply', 'qualified_reply', 'opt_out', 'booked', 'attended', 'follow_up', 'close_out', 'response_check')),
	CONSTRAINT "campaign_observations_outcome_check" CHECK ("campaign_observations"."outcome" IN ('verified', 'no_reply_observed', 'unavailable', 'unverified')),
	CONSTRAINT "campaign_observations_attribution_check" CHECK ("campaign_observations"."attribution" IN ('attributable', 'unattributed', 'unknown')),
	CONSTRAINT "campaign_observations_quantity_check" CHECK ("campaign_observations"."quantity" BETWEEN 0 AND 10000),
	CONSTRAINT "campaign_observations_no_reply_folders_check" CHECK ("campaign_observations"."outcome" <> 'no_reply_observed' OR ("campaign_observations"."event_type" = 'response_check' AND jsonb_array_length("campaign_observations"."checked_folders") > 0)),
	CONSTRAINT "campaign_observations_attribution_ref_check" CHECK ("campaign_observations"."attribution" <> 'attributable' OR "campaign_observations"."event_type" = 'response_check' OR "campaign_observations"."outcome" = 'unavailable' OR "campaign_observations"."visible_message_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "campaign_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cohort" text NOT NULL,
	"hypothesis" text NOT NULL,
	"channel" text DEFAULT 'manual_zoho_browser' NOT NULL,
	"state" text DEFAULT 'planned' NOT NULL,
	"response_check_due_at" timestamp with time zone NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_runs_channel_check" CHECK ("campaign_runs"."channel" = 'manual_zoho_browser'),
	CONSTRAINT "campaign_runs_state_check" CHECK ("campaign_runs"."state" IN ('planned', 'active', 'closed', 'retrospected'))
);
--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD CONSTRAINT "campaign_learning_actions_campaign_id_campaign_runs_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_observations" ADD CONSTRAINT "campaign_observations_campaign_id_campaign_runs_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_learning_actions_campaign_idx" ON "campaign_learning_actions" USING btree ("campaign_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_observations_request_unique" ON "campaign_observations" USING btree ("client_request_id");--> statement-breakpoint
CREATE INDEX "campaign_observations_campaign_time_idx" ON "campaign_observations" USING btree ("campaign_id","observed_at");--> statement-breakpoint
CREATE INDEX "campaign_runs_due_state_idx" ON "campaign_runs" USING btree ("state","response_check_due_at");