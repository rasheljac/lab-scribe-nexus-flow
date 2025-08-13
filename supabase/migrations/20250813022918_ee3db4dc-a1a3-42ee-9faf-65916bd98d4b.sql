
-- Create table for diet mice cohorts
CREATE TABLE public.diet_mice_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cohort_name TEXT NOT NULL,
  diet_type TEXT NOT NULL,
  diet_description TEXT,
  number_of_mice INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  duration_weeks INTEGER,
  cage_numbers TEXT[],
  mouse_strain TEXT,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'mixed')),
  age_at_start_weeks INTEGER,
  weight_at_start_grams NUMERIC,
  expected_weight_change_percent NUMERIC,
  monitoring_frequency TEXT DEFAULT 'weekly',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  display_order INTEGER DEFAULT 0
);

-- Add Row Level Security (RLS)
ALTER TABLE public.diet_mice_cohorts ENABLE ROW LEVEL SECURITY;

-- Create policies for diet_mice_cohorts
CREATE POLICY "Users can view their own diet cohorts" 
  ON public.diet_mice_cohorts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diet cohorts" 
  ON public.diet_mice_cohorts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet cohorts" 
  ON public.diet_mice_cohorts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet cohorts" 
  ON public.diet_mice_cohorts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for diet cohort measurements/tracking
CREATE TABLE public.diet_cohort_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL,
  user_id UUID NOT NULL,
  measurement_date DATE NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('weight', 'food_intake', 'water_intake', 'behavior', 'other')),
  average_value NUMERIC,
  unit TEXT,
  individual_values NUMERIC[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for measurements
ALTER TABLE public.diet_cohort_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for measurements
CREATE POLICY "Users can view their own cohort measurements" 
  ON public.diet_cohort_measurements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cohort measurements" 
  ON public.diet_cohort_measurements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cohort measurements" 
  ON public.diet_cohort_measurements 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cohort measurements" 
  ON public.diet_cohort_measurements 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at columns
CREATE TRIGGER update_diet_mice_cohorts_updated_at
  BEFORE UPDATE ON public.diet_mice_cohorts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_cohort_measurements_updated_at
  BEFORE UPDATE ON public.diet_cohort_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
