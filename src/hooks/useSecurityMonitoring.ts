
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type SecurityEvent = Tables<'security_logs'>;

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events', user?.id],
    queryFn: async (): Promise<SecurityEvent[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const logSecurityEvent = useMutation({
    mutationFn: async ({ event_type, details }: { event_type: string; details?: any }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type,
          ip_address: 'unknown', // Will be set by edge function if available
          user_agent: navigator.userAgent,
          details: details || {}
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error logging security event:', error);
      toast({
        title: "Error",
        description: "Failed to log security event",
        variant: "destructive",
      });
    },
  });

  const clearSecurityLogs = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('security_logs')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Security logs cleared successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['security-events', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error clearing security logs:', error);
      toast({
        title: "Error",
        description: "Failed to clear security logs",
        variant: "destructive",
      });
    },
  });

  const exportSecurityLogs = useCallback((format: 'csv' | 'json' = 'csv') => {
    if (!securityEvents?.length) {
      toast({
        title: "No Data",
        description: "No security events to export",
        variant: "destructive",
      });
      return;
    }

    let content = '';
    let filename = `security_logs_${new Date().toISOString().split('T')[0]}`;
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'Timestamp,Event Type,IP Address,User Agent,Details\n' +
          securityEvents.map(event => 
            `"${event.created_at}","${event.event_type}","${event.ip_address || 'unknown'}","${event.user_agent || 'unknown'}","${JSON.stringify(event.details)}"`
          ).join('\n');
        filename += '.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(securityEvents, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Security logs exported as ${format.toUpperCase()}`,
    });
  }, [securityEvents, toast]);

  const getEventTypeDisplay = (eventType: string) => {
    const eventTypeMap: Record<string, { label: string; color: string }> = {
      'login_success': { label: 'Login Success', color: 'text-green-600' },
      'login_failed': { label: 'Login Failed', color: 'text-red-600' },
      'logout': { label: 'Logout', color: 'text-blue-600' },
      'sms_send_attempt': { label: 'SMS Send Attempt', color: 'text-yellow-600' },
      'sms_send_success': { label: 'SMS Sent', color: 'text-green-600' },
      'sms_send_failed': { label: 'SMS Failed', color: 'text-red-600' },
      's3_operation_attempt': { label: 'File Operation', color: 'text-blue-600' },
      's3_upload_success': { label: 'File Upload Success', color: 'text-green-600' },
      's3_upload_failed': { label: 'File Upload Failed', color: 'text-red-600' },
      's3_delete_success': { label: 'File Delete Success', color: 'text-green-600' },
      's3_delete_failed': { label: 'File Delete Failed', color: 'text-red-600' },
    };

    return eventTypeMap[eventType] || { label: eventType, color: 'text-gray-600' };
  };

  return {
    securityEvents,
    eventsLoading,
    logSecurityEvent,
    clearSecurityLogs,
    exportSecurityLogs,
    getEventTypeDisplay,
  };
};
