
-- Add display_order column to experiment_notes table
ALTER TABLE public.experiment_notes 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing notes to have sequential display_order based on created_at (newest first gets highest order)
WITH ordered_notes AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY experiment_id ORDER BY created_at DESC) as new_order
  FROM public.experiment_notes
)
UPDATE public.experiment_notes 
SET display_order = ordered_notes.new_order
FROM ordered_notes 
WHERE public.experiment_notes.id = ordered_notes.id;

-- Create index for better performance
CREATE INDEX idx_experiment_notes_display_order ON public.experiment_notes(experiment_id, display_order);
