CREATE TABLE company_identity_resolutions (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  candidate_company_id TEXT NOT NULL REFERENCES companies(id),
  proposed_name TEXT NOT NULL,
  proposed_name_key TEXT NOT NULL,
  proposed_domain TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('same_entity', 'distinct_entity')),
  reason TEXT NOT NULL,
  evidence_ref_id TEXT NOT NULL REFERENCES evidence_refs(id),
  workflow_run_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (length(trim(proposed_name)) BETWEEN 1 AND 240),
  CHECK (length(trim(proposed_name_key)) BETWEEN 1 AND 240),
  CHECK (length(trim(proposed_domain)) BETWEEN 1 AND 253),
  CHECK (length(trim(reason)) BETWEEN 20 AND 2000),
  UNIQUE (id, proposed_name_key, proposed_domain)
);

CREATE INDEX company_identity_resolution_target_index
  ON company_identity_resolutions(proposed_name_key, proposed_domain, decision);

-- Store the application's NFKC identity key so database collision guards and service
-- lookups use the same Unicode/whitespace normalization.
CREATE TABLE company_alias_match_keys (
  alias_id TEXT PRIMARY KEY REFERENCES company_aliases(id),
  company_id TEXT NOT NULL REFERENCES companies(id),
  alias_type TEXT NOT NULL,
  relation TEXT NOT NULL,
  normalized_key TEXT NOT NULL
);

INSERT INTO company_alias_match_keys (alias_id, company_id, alias_type, relation, normalized_key)
SELECT id, company_id, alias_type, relation, normalized_alias FROM company_aliases;

CREATE TRIGGER company_alias_match_keys_after_insert
AFTER INSERT ON company_aliases
BEGIN
  INSERT INTO company_alias_match_keys (alias_id, company_id, alias_type, relation, normalized_key)
  VALUES (NEW.id, NEW.company_id, NEW.alias_type, NEW.relation, NEW.normalized_alias);
END;

CREATE TRIGGER company_alias_match_keys_no_update
BEFORE UPDATE ON company_alias_match_keys
BEGIN
  SELECT RAISE(ABORT, 'company alias match keys are immutable');
END;

CREATE TRIGGER company_alias_match_keys_validate_insert
BEFORE INSERT ON company_alias_match_keys
WHEN NOT EXISTS (
  SELECT 1 FROM company_aliases ca
  WHERE ca.id = NEW.alias_id AND ca.company_id = NEW.company_id
    AND ca.alias_type = NEW.alias_type AND ca.relation = NEW.relation
    AND NEW.normalized_key = ca.normalized_alias
)
BEGIN
  SELECT RAISE(ABORT, 'company alias match key must derive from its source alias');
END;

CREATE TRIGGER company_alias_match_keys_no_delete
BEFORE DELETE ON company_alias_match_keys
BEGIN
  SELECT RAISE(ABORT, 'company alias match keys are immutable');
END;

ALTER TABLE companies ADD COLUMN identity_resolution_id TEXT REFERENCES company_identity_resolutions(id);
ALTER TABLE companies ADD COLUMN identity_name_key TEXT;
CREATE UNIQUE INDEX companies_identity_resolution_unique_index
  ON companies(identity_resolution_id) WHERE identity_resolution_id IS NOT NULL;

CREATE TRIGGER companies_identity_name_key_required
BEFORE INSERT ON companies
WHEN EXISTS (
  SELECT 1 FROM companies WHERE identity_name_key IS NULL OR length(trim(identity_name_key)) = 0
)
BEGIN
  SELECT RAISE(ABORT, 'legacy company identity keys require service backfill before company creation');
END;

CREATE TRIGGER companies_identity_name_key_required_value
BEFORE INSERT ON companies
WHEN NEW.identity_name_key IS NULL OR length(trim(NEW.identity_name_key)) = 0
BEGIN
  SELECT RAISE(ABORT, 'company identity name key is required');
END;

-- SQLite cannot verify JavaScript's NFKC/case/whitespace normalization. The D1
-- binding is private; company writes must use the gateway's key-generating path.
-- These triggers guard collisions and state transitions, not privileged SQL that
-- deliberately forges identity_name_key.

CREATE TRIGGER company_identity_resolutions_validate_insert
BEFORE INSERT ON company_identity_resolutions
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM evidence_refs e
      WHERE e.id = NEW.evidence_ref_id
        AND e.company_id = NEW.candidate_company_id
        AND e.workflow_run_id = NEW.workflow_run_id
    ) THEN RAISE(ABORT, 'identity resolution must cite evidence belonging to candidate company and workflow')
  END;
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM research_runs rr
      WHERE rr.company_id = NEW.candidate_company_id AND rr.workflow_run_id = NEW.workflow_run_id
        AND rr.state = 'researched' AND rr.completed_at IS NOT NULL
    ) THEN RAISE(ABORT, 'identity resolution must cite a completed research run belonging to candidate company and workflow')
  END;
  SELECT CASE
    WHEN NEW.decision = 'distinct_entity' AND EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = NEW.candidate_company_id AND c.normalized_domain = NEW.proposed_domain
    ) THEN RAISE(ABORT, 'distinct entity must have a different website domain from candidate')
  END;
  SELECT CASE
    WHEN NEW.decision = 'distinct_entity' AND NOT EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = NEW.candidate_company_id
        AND (
          c.identity_name_key = NEW.proposed_name_key
          OR EXISTS (
            SELECT 1 FROM company_alias_match_keys cak
            WHERE cak.company_id = c.id AND cak.relation = 'same_entity'
              AND ((cak.alias_type != 'website_domain' AND cak.normalized_key = NEW.proposed_name_key)
                OR (cak.alias_type = 'website_domain' AND cak.normalized_key = NEW.proposed_domain))
          )
        )
    ) THEN RAISE(ABORT, 'distinct identity resolution must address a canonical-name or same-entity alias collision on candidate')
  END;
END;

CREATE TRIGGER company_identity_resolutions_no_update
BEFORE UPDATE ON company_identity_resolutions
BEGIN
  SELECT RAISE(ABORT, 'company identity resolutions are append-only');
END;

CREATE TRIGGER company_identity_resolutions_no_delete
BEFORE DELETE ON company_identity_resolutions
BEGIN
  SELECT RAISE(ABORT, 'company identity resolutions are append-only');
END;

DROP TRIGGER companies_prevent_ambiguous_name_insert;
CREATE TRIGGER companies_prevent_ambiguous_name_insert
BEFORE INSERT ON companies
WHEN (
  EXISTS (
    SELECT 1
    FROM companies existing
    WHERE existing.identity_name_key = NEW.identity_name_key
      AND (existing.normalized_domain IS NULL OR NEW.normalized_domain IS NULL)
  )
  OR EXISTS (
    SELECT 1 FROM company_alias_match_keys cak
    WHERE cak.relation = 'same_entity'
      AND (
        (cak.alias_type != 'website_domain' AND cak.normalized_key = NEW.identity_name_key)
        OR (cak.alias_type = 'website_domain' AND cak.normalized_key = NEW.normalized_domain)
      )
  )
)
AND NOT EXISTS (
  SELECT 1 FROM company_identity_resolutions r
  WHERE r.id = NEW.identity_resolution_id
    AND r.decision = 'distinct_entity'
    AND r.proposed_name_key = NEW.identity_name_key
    AND r.proposed_domain = NEW.normalized_domain
    AND (
      EXISTS (
        SELECT 1 FROM company_alias_match_keys cak
        WHERE cak.company_id = r.candidate_company_id AND cak.relation = 'same_entity'
          AND (
            (cak.alias_type != 'website_domain' AND cak.normalized_key = NEW.identity_name_key)
            OR (cak.alias_type = 'website_domain' AND cak.normalized_key = NEW.normalized_domain)
          )
      )
      OR EXISTS (
        SELECT 1 FROM companies candidate
        WHERE candidate.id = r.candidate_company_id
          AND candidate.identity_name_key = NEW.identity_name_key
          AND (candidate.normalized_domain IS NULL OR NEW.normalized_domain IS NULL)
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM companies other
      WHERE other.id != r.candidate_company_id
        AND other.identity_name_key = NEW.identity_name_key
        AND (other.normalized_domain IS NULL OR NEW.normalized_domain IS NULL)
    )
    AND NOT EXISTS (
      SELECT 1 FROM company_alias_match_keys other
      WHERE other.company_id != r.candidate_company_id AND other.relation = 'same_entity'
        AND (
          (other.alias_type != 'website_domain' AND other.normalized_key = NEW.identity_name_key)
          OR (other.alias_type = 'website_domain' AND other.normalized_key = NEW.normalized_domain)
        )
    )
)
BEGIN
  SELECT RAISE(ABORT, 'company name collision requires identity resolution');
END;

CREATE TRIGGER companies_identity_resolution_immutable
BEFORE UPDATE OF identity_resolution_id ON companies
WHEN NEW.identity_resolution_id IS NOT OLD.identity_resolution_id
BEGIN
  SELECT RAISE(ABORT, 'company identity resolution reference is immutable');
END;

CREATE TRIGGER companies_identity_name_key_immutable_after_backfill
BEFORE UPDATE OF identity_name_key ON companies
WHEN OLD.identity_name_key IS NOT NULL AND NEW.identity_name_key IS NOT OLD.identity_name_key
BEGIN
  SELECT RAISE(ABORT, 'company identity name key is immutable after backfill');
END;

CREATE TRIGGER companies_identity_resolved_identity_fields_immutable
BEFORE UPDATE OF name, identity_name_key, normalized_domain, website_url ON companies
WHEN OLD.identity_resolution_id IS NOT NULL AND (
  NEW.name IS NOT OLD.name
  OR NEW.identity_name_key IS NOT OLD.identity_name_key
  OR NEW.normalized_domain IS NOT OLD.normalized_domain
  OR NEW.website_url IS NOT OLD.website_url
)
BEGIN
  SELECT RAISE(ABORT, 'company identity fields bound to a resolution are immutable');
END;

CREATE TRIGGER companies_identity_resolution_no_delete
BEFORE DELETE ON companies
WHEN OLD.identity_resolution_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'a company with an identity resolution cannot be deleted');
END;
