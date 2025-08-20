
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
      
      // For now, we'll update the query cache directly since there's no display_order column yet
      // This provides immediate UI feedback while maintaining the new order
      queryClient.setQueryData(['experimentNotes', experimentId, 'all'], reorderedNotes);
      
      // TODO: Once display_order column is added to experiment_notes table,
      // uncomment this code to persist the order to the database:
      /*
      const updates = reorderedNotes.map((note, index) => 
        supabase
          .from('experiment_notes')
          .update({ display_order: index + 1 })
          .eq('id', note.id)
          .eq('user_id', user?.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update note order');
      }
      */
    },
    onSuccess: () => {
      // Don't invalidate queries since we're manually updating the cache
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
