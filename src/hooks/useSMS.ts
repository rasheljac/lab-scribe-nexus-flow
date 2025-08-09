
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SMSLog } from "@/types/sms";

export const useSMS = () => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  const { data: smsLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['sms-logs', user?.id],
    queryFn: async (): Promise<SMSLog[]> => {
      if (!user) return [];
      
      // Use a raw query since the table might not be in the generated types yet
      const { data, error } = await supabase
        .from('sms_logs' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SMSLog[];
    },
    enabled: !!user,
  });

  return {
    sendSMS,
    smsLogs,
    logsLoading,
  };
};
