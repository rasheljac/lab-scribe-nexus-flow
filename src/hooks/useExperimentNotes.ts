
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
        .order('display_order', { ascending: true });

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
    mutationFn: async (note: Omit<ExperimentNote, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating note for experiment:', note.experiment_id);

      // Get the current notes count to determine the next display_order
      const { data: existingNotes, error: countError } = await supabase
        .from('experiment_notes')
        .select('display_order')
        .eq('experiment_id', note.experiment_id)
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error fetching existing notes:', countError);
        throw countError;
      }

      // Calculate next display_order (highest + 1, or 1 if no notes exist)
      const maxOrder = existingNotes && existingNotes.length > 0 
        ? Math.max(...existingNotes.map(n => n.display_order || 0))
        : 0;
      const nextOrder = maxOrder + 1;

      console.log('Next display order:', nextOrder);

      const { data, error } = await supabase
        .from('experiment_notes')
        .insert([{ 
          ...note, 
          user_id: user.id,
          display_order: nextOrder
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }

      console.log('Note created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
    onError: (error) => {
      console.error('Create note mutation error:', error);
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
      
      // Update display_order for each note in the database
      try {
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
          console.error('Errors updating note order:', errors);
          // Revert the optimistic update if there were database errors
          queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
          throw new Error('Failed to update note order');
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
