ALTER TABLE "campaign_learning_actions" ADD COLUMN "supporting_observation_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM "campaign_observations"
    WHERE "visible_message_id" IS NOT NULL
    GROUP BY "visible_message_id", "event_type"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate visible Zoho message/event observations require manual reconciliation before migration 0010';
  END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_observations_message_event_unique" ON "campaign_observations" USING btree ("visible_message_id","event_type") WHERE "campaign_observations"."visible_message_id" IS NOT NULL;
