
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SMSLog } from "@/types/sms";

export const useSMS = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendSMS = useMutation({
    mutationFn: async ({ message, mobile_number }: { message: string; mobile_number: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { 
          message, 
          mobile_number,
          user_id: user.id 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('SMS sent successfully', data);
      toast({
        title: "Success",
        description: "SMS message sent successfully",
      });
      // Refetch SMS logs after successful send
      queryClient.invalidateQueries({ queryKey: ['sms-logs', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send SMS message",
        variant: "destructive",
      });
    },
  });

  const deleteSMS = useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('sms_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      console.log('SMS log deleted successfully');
      toast({
        title: "Success",
        description: "SMS log deleted successfully",
      });
      // Refetch SMS logs after successful deletion
      queryClient.invalidateQueries({ queryKey: ['sms-logs', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error deleting SMS log:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete SMS log",
        variant: "destructive",
      });
    },
  });

  const { data: smsLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['sms-logs', user?.id],
    queryFn: async (): Promise<SMSLog[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as SMSLog[];
    },
    enabled: !!user,
  });

  return {
    sendSMS,
    deleteSMS,
    smsLogs,
    logsLoading,
  };
};
