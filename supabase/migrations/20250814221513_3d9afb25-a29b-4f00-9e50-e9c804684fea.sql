
-- Add the display_order column to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Update existing records to have sequential display_order values based on creation date
WITH ordered_items AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_order
  FROM public.inventory_items
  WHERE display_order = 0 OR display_order IS NULL
)
UPDATE public.inventory_items 
SET display_order = ordered_items.new_order
FROM ordered_items 
WHERE public.inventory_items.id = ordered_items.id;
