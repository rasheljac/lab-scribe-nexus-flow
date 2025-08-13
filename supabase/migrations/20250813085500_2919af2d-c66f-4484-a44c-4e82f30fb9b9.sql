
-- Create diet_mice_cohorts table
CREATE TABLE public.diet_mice_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cohort_name TEXT NOT NULL,
  diet_type TEXT NOT NULL,
  diet_description TEXT,
  number_of_mice INTEGER NOT NULL DEFAULT 0,
  mouse_strain TEXT,
  sex TEXT NOT NULL,
  age_at_start_weeks INTEGER,
  weight_at_start_grams NUMERIC,
  start_date DATE NOT NULL,
  end_date DATE,
  duration_weeks INTEGER,
  expected_weight_change_percent NUMERIC,
  cage_numbers TEXT[],
  monitoring_frequency TEXT DEFAULT 'weekly',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_cohort_measurements table
CREATE TABLE public.diet_cohort_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_id UUID NOT NULL,
  user_id UUID NOT NULL,
  measurement_type TEXT NOT NULL,
  measurement_date DATE NOT NULL,
  average_value NUMERIC,
  individual_values NUMERIC[],
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to diet_mice_cohorts
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

-- Add Row Level Security (RLS) to diet_cohort_measurements
ALTER TABLE public.diet_cohort_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for diet_cohort_measurements
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

-- Add triggers to update the updated_at columns
CREATE TRIGGER update_diet_mice_cohorts_updated_at 
  BEFORE UPDATE ON public.diet_mice_cohorts 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_diet_cohort_measurements_updated_at 
  BEFORE UPDATE ON public.diet_cohort_measurements 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
