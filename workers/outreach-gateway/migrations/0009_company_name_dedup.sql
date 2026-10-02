ALTER TABLE companies ADD COLUMN normalized_name TEXT;

UPDATE companies
SET normalized_name = lower(trim(name));

CREATE INDEX companies_normalized_name_index
  ON companies(normalized_name);

-- A name-only identity cannot be inserted alongside any same-name row, and a
-- domain-bearing identity cannot be added beside a same-name domainless row.
-- Distinct domain-bearing companies may share a name; domain uniqueness remains
-- enforced by companies_domain_unique.
CREATE TRIGGER companies_prevent_ambiguous_name_insert
BEFORE INSERT ON companies
WHEN EXISTS (
  SELECT 1
  FROM companies existing
  WHERE existing.normalized_name = lower(trim(NEW.name))
    AND (existing.normalized_domain IS NULL OR NEW.normalized_domain IS NULL)
)
BEGIN
  SELECT RAISE(ABORT, 'company name collision requires identity resolution');
END;
