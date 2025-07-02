
-- Add display_order column to mice_orders table
ALTER TABLE public.mice_orders 
ADD COLUMN display_order INTEGER DEFAULT 0;
