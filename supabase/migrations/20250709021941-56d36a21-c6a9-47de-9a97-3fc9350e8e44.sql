
-- Add display_order column to experiment_notes table
ALTER TABLE public.experiment_notes 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing notes to have sequential display_order values
UPDATE public.experiment_notes 
SET display_order = row_number() OVER (PARTITION BY experiment_id ORDER BY created_at)
WHERE display_order = 0;
