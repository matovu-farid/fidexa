CREATE TABLE "campaign_learning_action_events" (
	"id" text PRIMARY KEY NOT NULL,
	"action_id" text NOT NULL,
	"event_kind" text NOT NULL,
	"previous_status" text,
	"status" text NOT NULL,
	"rationale" text NOT NULL,
	"evidence_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"decision" text NOT NULL,
	"implementation_reference" text,
	"result" text,
	"client_request_id" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_learning_action_events_kind_check" CHECK ("campaign_learning_action_events"."event_kind" IN ('created', 'transition', 'migration_snapshot')),
	CONSTRAINT "campaign_learning_action_events_status_check" CHECK ("campaign_learning_action_events"."status" IN ('proposed', 'applied', 'needs_user_decision', 'rejected', 'evaluated'))
);
--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "measurement_window_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "measurement_window_end_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "measurement_checkpoint_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "rationale" text;--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "evidence_refs" jsonb;--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "decision" text;--> statement-breakpoint
ALTER TABLE "campaign_learning_actions" ADD COLUMN "client_request_id" text;--> statement-breakpoint
ALTER TABLE "campaign_learning_action_events" ADD CONSTRAINT "campaign_learning_action_events_action_id_campaign_learning_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."campaign_learning_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_learning_action_events_request_unique" ON "campaign_learning_action_events" USING btree ("client_request_id");--> statement-breakpoint
CREATE INDEX "campaign_learning_action_events_action_time_idx" ON "campaign_learning_action_events" USING btree ("action_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_learning_actions_request_unique" ON "campaign_learning_actions" USING btree ("client_request_id");--> statement-breakpoint
INSERT INTO "campaign_learning_action_events" (
	"id", "action_id", "event_kind", "previous_status", "status", "rationale", "evidence_refs", "decision", "implementation_reference", "result", "client_request_id", "created_by", "created_at"
)
SELECT 'migration-' || "id", "id", 'migration_snapshot', NULL, "status",
	'Legacy action snapshot created during migration; prior transition history was not stored.', '[]'::jsonb,
	'Preserve the recorded status as the starting point for future history.', "implementation_reference", "result",
	'migration-' || "id", "created_by", "updated_at"
FROM "campaign_learning_actions";--> statement-breakpoint
CREATE FUNCTION "reject_campaign_learning_action_event_mutation"() RETURNS trigger AS $$
BEGIN
	RAISE EXCEPTION 'campaign learning action history is append-only';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "campaign_learning_action_events_append_only"
BEFORE UPDATE OR DELETE ON "campaign_learning_action_events"
FOR EACH ROW EXECUTE FUNCTION "reject_campaign_learning_action_event_mutation"();
