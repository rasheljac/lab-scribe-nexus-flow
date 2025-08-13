
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDietCohortMeasurements = (cohortId: string) => {
  return useQuery({
    queryKey: ["diet-cohort-measurements", cohortId],
    queryFn: async () => {
      if (!cohortId) return [];
      
      const { data, error } = await supabase
        .from("diet_cohort_measurements")
        .select("*")
        .eq("cohort_id", cohortId)
        .order("measurement_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!cohortId,
  });
};

export const useCreateDietCohortMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (measurementData: any) => {
      const { data, error } = await supabase
        .from("diet_cohort_measurements")
        .insert([measurementData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["diet-cohort-measurements", data.cohort_id] });
      toast.success("Measurement added successfully");
    },
    onError: (error) => {
      console.error("Error creating measurement:", error);
      toast.error("Failed to add measurement");
    },
  });
};

export const useDeleteDietCohortMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("diet_cohort_measurements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-cohort-measurements"] });
      toast.success("Measurement deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting measurement:", error);
      toast.error("Failed to delete measurement");
    },
  });
};
