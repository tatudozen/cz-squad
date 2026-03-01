-- Add 'title' column to briefings table
-- Rationale: Title is required for briefing identification in the system
-- This allows briefings to have a dedicated title field separate from business_name

ALTER TABLE briefings
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Copy business_name to title for existing records (if any)
UPDATE briefings
SET title = business_name
WHERE title IS NULL AND business_name IS NOT NULL;

-- Create index on title for faster lookups
CREATE INDEX IF NOT EXISTS idx_briefings_title ON briefings(title);

COMMENT ON COLUMN briefings.title IS 'Briefing title - identifies the scope/project';
