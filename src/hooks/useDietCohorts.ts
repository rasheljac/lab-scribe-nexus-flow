
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DietCohort {
  id: string;
  user_id: string;
  cohort_name: string;
  diet_type: string;
  diet_description: string | null;
  number_of_mice: number;
  start_date: string;
  end_date: string | null;
  duration_weeks: number | null;
  cage_numbers: string[] | null;
  mouse_strain: string | null;
  sex: 'male' | 'female' | 'mixed';
  age_at_start_weeks: number | null;
  weight_at_start_grams: number | null;
  expected_weight_change_percent: number | null;
  monitoring_frequency: string | null;
  notes: string | null;
  status: 'active' | 'completed' | 'terminated' | 'on_hold';
  created_at: string;
  updated_at: string;
  display_order: number | null;
}

export interface DietMeasurement {
  id: string;
  cohort_id: string;
  user_id: string;
  measurement_date: string;
  measurement_type: 'weight' | 'food_intake' | 'water_intake' | 'behavior' | 'other';
  average_value: number | null;
  unit: string | null;
  individual_values: number[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useDietCohorts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cohorts, isLoading, error } = useQuery({
    queryKey: ['diet-cohorts'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('diet_mice_cohorts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DietCohort[];
    },
    enabled: !!user,
  });

  const createCohort = useMutation({
    mutationFn: async (cohort: Omit<DietCohort, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('diet_mice_cohorts')
        .insert([{ ...cohort, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-cohorts'] });
    },
  });

  const updateCohort = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DietCohort> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('diet_mice_cohorts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-cohorts'] });
    },
  });

  const deleteCohort = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('diet_mice_cohorts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-cohorts'] });
    },
  });

  return {
    cohorts: cohorts || [],
    isLoading,
    error,
    createCohort,
    updateCohort,
    deleteCohort,
  };
};

export const useDietMeasurements = (cohortId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: measurements, isLoading, error } = useQuery({
    queryKey: ['diet-measurements', cohortId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('diet_cohort_measurements')
        .select('*')
        .eq('cohort_id', cohortId)
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false });

      if (error) throw error;
      return data as DietMeasurement[];
    },
    enabled: !!user && !!cohortId,
  });

  const addMeasurement = useMutation({
    mutationFn: async (measurement: Omit<DietMeasurement, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('diet_cohort_measurements')
        .insert([{ ...measurement, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-measurements', cohortId] });
    },
  });

  return {
    measurements: measurements || [],
    isLoading,
    error,
    addMeasurement,
  };
};
