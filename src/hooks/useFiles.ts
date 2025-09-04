import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserFile {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export const useFiles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user files
  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ['user-files', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('experiment_attachments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserFile[];
    },
    enabled: !!user,
  });

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      if (!user) throw new Error("User not authenticated");

      // Create a temporary note ID for file uploads (using user files context)
      const tempNoteId = `user-file-${Date.now()}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('noteId', tempNoteId);

      const response = await supabase.functions.invoke('s3-file-operations', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      // Create our own user files entry in experiment_attachments for now
      const { data, error } = await supabase
        .from('experiment_attachments')
        .insert([{
          user_id: user.id,
          experiment_id: tempNoteId, // Using temp ID until we have proper user_files table
          filename: file.name,
          file_path: response.data.file_path,
          file_type: file.type,
          file_size: file.size,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-files'] });
    },
  });

  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!user) throw new Error("User not authenticated");

      // First get the file details
      const { data: file, error: fetchError } = await supabase
        .from('experiment_attachments')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !file) {
        throw new Error('File not found');
      }

      // Delete from S3 (using the existing edge function)
      const response = await supabase.functions.invoke('s3-file-operations', {
        body: {
          attachmentId: fileId,
        },
      });

      if (response.error) {
        console.error('S3 delete error:', response.error);
        // Continue with database deletion even if S3 delete fails
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('experiment_attachments')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-files'] });
    },
  });

  // Download file function
  const downloadFile = async (fileId: string, filename: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // Request download URL from edge function
      const response = await supabase.functions.invoke('s3-file-operations', {
        body: {
          action: 'download',
          attachmentId: fileId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Download failed');
      }

      const { downloadUrl, contentType } = response.data;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      
      // Add to DOM temporarily to ensure it works in all browsers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
    downloadFile,
  };
};