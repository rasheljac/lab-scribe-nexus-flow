
-- Add display_order column to inventory_items table
ALTER TABLE inventory_items ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing records to have sequential display_order values
UPDATE inventory_items 
SET display_order = row_number() OVER (PARTITION BY user_id ORDER BY created_at);

-- Create function to update inventory display order
CREATE OR REPLACE FUNCTION update_inventory_display_order(updates jsonb)
RETURNS void AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE inventory_items 
    SET display_order = (item->>'display_order')::integer
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
