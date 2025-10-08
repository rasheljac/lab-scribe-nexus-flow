import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Conversation {
  id: string;
  user_id: string;
  participant_id: string;
  last_message: string | null;
  last_message_at: string | null;
  is_group: boolean;
  group_name: string | null;
  created_at: string;
  updated_at: string;
  unread_count: number;
  participant_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  attachment_url: string | null;
  attachment_type: string | null;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_id.eq.${user.id},participant_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Fetch participant profiles separately
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          const participantId = conv.user_id === user.id ? conv.participant_id : conv.user_id;
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name, avatar_url, email')
            .eq('user_id', participantId)
            .maybeSingle();
          
          return {
            ...conv,
            participant_profile: profile || undefined,
          };
        })
      );

      return conversationsWithProfiles as Conversation[];
    },
    enabled: !!user,
  });

  const createConversation = useMutation({
    mutationFn: async ({ participantId, groupName }: { participantId: string; groupName?: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user_id: user.id,
          participant_id: participantId,
          is_group: !!groupName,
          group_name: groupName,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations,
    isLoading,
    createConversation,
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId && !!user,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, attachmentUrl, attachmentType }: { 
      content: string; 
      attachmentUrl?: string;
      attachmentType?: string;
    }) => {
      if (!user || !conversationId) throw new Error("Invalid request");

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
