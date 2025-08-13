
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDietCohorts = () => {
  return useQuery({
    queryKey: ["diet-cohorts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("diet_mice_cohorts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateDietCohort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cohortData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("diet_mice_cohorts")
        .insert([{ ...cohortData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-cohorts"] });
      toast.success("Diet cohort created successfully");
    },
    onError: (error) => {
      console.error("Error creating diet cohort:", error);
      toast.error("Failed to create diet cohort");
    },
  });
};

export const useUpdateDietCohort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("diet_mice_cohorts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-cohorts"] });
      toast.success("Diet cohort updated successfully");
    },
    onError: (error) => {
      console.error("Error updating diet cohort:", error);
      toast.error("Failed to update diet cohort");
    },
  });
};

export const useDeleteDietCohort = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("diet_mice_cohorts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-cohorts"] });
      toast.success("Diet cohort deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting diet cohort:", error);
      toast.error("Failed to delete diet cohort");
    },
  });
};
