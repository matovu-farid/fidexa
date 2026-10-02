CREATE TABLE company_aliases (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  alias_type TEXT NOT NULL CHECK (alias_type IN (
    'legal_name', 'trading_name', 'former_name', 'website_domain',
    'brand', 'parent_group', 'subsidiary', 'division'
  )),
  relation TEXT NOT NULL CHECK (relation IN ('same_entity', 'related_entity')),
  evidence_ref_id TEXT NOT NULL REFERENCES evidence_refs(id),
  workflow_run_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (length(trim(alias)) BETWEEN 1 AND 240),
  CHECK (length(trim(normalized_alias)) BETWEEN 1 AND 240),
  CHECK (instr(normalized_alias, '@') = 0),
  CHECK (relation = CASE
    WHEN alias_type IN ('legal_name', 'trading_name', 'former_name', 'website_domain') THEN 'same_entity'
    ELSE 'related_entity'
  END),
  UNIQUE (company_id, alias_type, normalized_alias)
);

CREATE INDEX company_aliases_normalized_lookup_index
  ON company_aliases(normalized_alias, alias_type);

CREATE INDEX company_aliases_company_created_index
  ON company_aliases(company_id, created_at DESC);

CREATE TRIGGER company_aliases_validate_insert
BEFORE INSERT ON company_aliases
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM evidence_refs e
      WHERE e.id = NEW.evidence_ref_id
        AND e.company_id = NEW.company_id
        AND e.workflow_run_id = NEW.workflow_run_id
    ) THEN RAISE(ABORT, 'company alias must cite evidence belonging to the company and workflow')
  END;
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM research_runs rr
      WHERE rr.company_id = NEW.company_id AND rr.workflow_run_id = NEW.workflow_run_id
    ) THEN RAISE(ABORT, 'company alias must cite a research run belonging to the company and workflow')
  END;
END;

CREATE TRIGGER company_aliases_no_update
BEFORE UPDATE ON company_aliases
BEGIN
  SELECT RAISE(ABORT, 'company aliases are append-only');
END;

CREATE TRIGGER company_aliases_no_delete
BEFORE DELETE ON company_aliases
BEGIN
  SELECT RAISE(ABORT, 'company aliases are append-only');
END;
