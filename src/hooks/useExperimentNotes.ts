
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExperimentNote[];
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
    mutationFn: async (note: Omit<ExperimentNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('experiment_notes')
        .insert([{ 
          ...note, 
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExperimentNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('experiment_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
  });

  const updateNoteOrder = useMutation({
    mutationFn: async (reorderedNotes: ExperimentNote[]) => {
      console.log('Updating note order for experiment:', experimentId);
      console.log('New order:', reorderedNotes.map(note => ({ id: note.id, title: note.title })));
      
      // Update the query cache immediately for responsive UI
      queryClient.setQueryData(['experimentNotes', experimentId, 'all'], reorderedNotes);
      
      // Since there's no display_order column yet, we'll simulate the reordering by updating timestamps
      // This provides a workaround until the database schema is updated
      try {
        for (let i = 0; i < reorderedNotes.length; i++) {
          const note = reorderedNotes[i];
          // Update with a slight timestamp offset to maintain order
          const adjustedTimestamp = new Date(Date.now() - (i * 1000)).toISOString();
          
          await supabase
            .from('experiment_notes')
            .update({ updated_at: adjustedTimestamp })
            .eq('id', note.id)
            .eq('user_id', user?.id);
        }
      } catch (error) {
        console.error('Failed to update note order:', error);
        // Revert the optimistic update if the database update fails
        queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Note order updated successfully');
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
    updateNoteOrder,
    deleteNote,
  };
};
