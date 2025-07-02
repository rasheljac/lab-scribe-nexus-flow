
-- Create a table for mice orders
CREATE TABLE public.mice_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strain_name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL DEFAULT 1,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'mixed')),
  age_weeks INTEGER,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  cost_per_mouse DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  order_reference TEXT,
  special_requirements TEXT,
  housing_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.mice_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for mice_orders
CREATE POLICY "Users can view their own mice orders" 
  ON public.mice_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mice orders" 
  ON public.mice_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mice orders" 
  ON public.mice_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mice orders" 
  ON public.mice_orders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_mice_orders_updated_at 
  BEFORE UPDATE ON public.mice_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
