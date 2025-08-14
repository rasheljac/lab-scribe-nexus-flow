
-- Add display_order columns where missing and create indexes for pagination
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing records to have proper display_order values
UPDATE projects 
SET display_order = COALESCE(
  (SELECT ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) 
   FROM projects p2 WHERE p2.id = projects.id), 
  0
) 
WHERE display_order IS NULL OR display_order = 0;

UPDATE protocols 
SET display_order = COALESCE(
  (SELECT ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) 
   FROM protocols p2 WHERE p2.id = protocols.id), 
  0
) 
WHERE display_order IS NULL OR display_order = 0;

UPDATE diet_mice_cohorts 
SET display_order = COALESCE(
  (SELECT ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) 
   FROM diet_mice_cohorts d2 WHERE d2.id = diet_mice_cohorts.id), 
  0
) 
WHERE display_order IS NULL OR display_order = 0;

-- Create indexes for better pagination performance
CREATE INDEX IF NOT EXISTS idx_projects_user_display_order ON projects(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_experiments_user_display_order ON experiments(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_experiment_ideas_user_display_order ON experiment_ideas(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_diet_mice_cohorts_user_display_order ON diet_mice_cohorts(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_mice_orders_user_display_order ON mice_orders(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_protocols_user_display_order ON protocols(user_id, display_order);
