
-- Create the update_inventory_display_order RPC function
CREATE OR REPLACE FUNCTION public.update_inventory_display_order(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    update_record jsonb;
BEGIN
    FOR update_record IN SELECT * FROM jsonb_array_elements(updates)
    LOOP
        UPDATE public.inventory_items 
        SET display_order = (update_record->>'display_order')::integer
        WHERE id = (update_record->>'id')::uuid;
    END LOOP;
END;
$$;
