
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExperimentNote {
  id: string;
  experiment_id: string;
  user_id: string;
  title: string;
  content: string | null;
  folder_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useExperimentNotes = (experimentId: string, page: number = 1, pageSize: number = 4) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allNotes, isLoading: isLoadingAll } = useQuery({
    queryKey: ['experimentNotes', experimentId, 'all'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_notes')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map the data to ensure display_order is present
      return (data || []).map((note: any) => ({
        ...note,
        display_order: note.display_order || 0
      })) as ExperimentNote[];
    },
    enabled: !!user && !!experimentId,
  });

  // Calculate pagination
  const totalNotes = allNotes?.length || 0;
  const totalPages = Math.ceil(totalNotes / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNotes = allNotes?.slice(startIndex, endIndex) || [];

  const createNote = useMutation({
    mutationFn: async (note: Omit<ExperimentNote, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
      if (!user) throw new Error('User not authenticated');

      // Get the highest display_order for this experiment
      const { data: existingNotes } = await supabase
        .from('experiment_notes')
        .select('display_order')
        .eq('experiment_id', experimentId)
        .order('display_order', { ascending: false })
        .limit(1);

      const maxOrder = (existingNotes?.[0] as any)?.display_order || 0;

      const insertData: any = { 
        ...note, 
        user_id: user.id,
        display_order: maxOrder + 1
      };

      const { data, error } = await supabase
        .from('experiment_notes')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        display_order: (data as any).display_order || maxOrder + 1
      } as ExperimentNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExperimentNote> & { id: string }) => {
      const updateData: any = { ...updates };
      
      const { data, error } = await supabase
        .from('experiment_notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        display_order: (data as any).display_order || 0
      } as ExperimentNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experiment_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
  });

  const reorderNotes = useMutation({
    mutationFn: async (reorderedNotes: ExperimentNote[]) => {
      const updates = reorderedNotes.map((note, index) => ({
        id: note.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('experiment_notes')
          .update({ display_order: update.display_order } as any)
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
  });

  return {
    notes: paginatedNotes,
    allNotes: allNotes || [],
    totalNotes,
    totalPages,
    currentPage: page,
    isLoading: isLoadingAll,
    error: null,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
  };
};
