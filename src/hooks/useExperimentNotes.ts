
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

export const useExperimentNotes = (experimentId: string, page: number = 1, pageSize: number = 1000) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allNotes, isLoading: isLoadingAll, error } = useQuery({
    queryKey: ['experimentNotes', experimentId, 'all'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching notes for experiment:', experimentId, 'user:', user.id);
      
      const { data, error } = await supabase
        .from('experiment_notes')
        .select('*')
        .eq('experiment_id', experimentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching experiment notes:', error);
        throw error;
      }
      
      console.log('Fetched notes:', data?.length || 0);
      return data as ExperimentNote[];
    },
    enabled: !!user && !!experimentId,
  });

  // For backward compatibility, return paginated notes if needed
  const totalNotes = allNotes?.length || 0;
  const totalPages = Math.ceil(totalNotes / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNotes = pageSize < 100 ? allNotes?.slice(startIndex, endIndex) || [] : allNotes || [];

  const createNote = useMutation({
    mutationFn: async (note: Omit<ExperimentNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating note:', note);
      
      const { data, error } = await supabase
        .from('experiment_notes')
        .insert([{ 
          ...note, 
          user_id: user.id
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
    onSuccess: (newNote) => {
      // Optimistically update the cache
      queryClient.setQueryData(['experimentNotes', experimentId, 'all'], (oldData: ExperimentNote[] | undefined) => {
        if (!oldData) return [newNote];
        return [newNote, ...oldData];
      });
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['experimentNotes', experimentId] });
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
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
      
      // Update the query cache directly since there's no display_order column yet
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
    error,
    createNote,
    updateNote,
    updateNoteOrder,
    deleteNote,
  };
};
