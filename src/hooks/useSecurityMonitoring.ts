
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Define the security log type to match the actual database schema
interface SecurityLog {
  id: string;
  user_id: string | null;
  event_type: string;
  event_description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: securityLogs = [], isLoading } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error fetching security logs:', error);
          return [];
        }
        
        // Map the database fields to our interface
        const mappedData = (data || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          event_type: item.event_type,
          event_description: item.details ? JSON.stringify(item.details) : item.event_type,
          ip_address: item.ip_address,
          user_agent: item.user_agent,
          metadata: item.details || {},
          created_at: item.created_at,
        }));
        
        return mappedData as SecurityLog[];
      } catch (error) {
        console.error('Security logs table may not exist yet:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  const logSecurityEventMutation = useMutation({
    mutationFn: async ({ 
      eventType, 
      description, 
      metadata = {} 
    }: { 
      eventType: string; 
      description: string; 
      metadata?: Record<string, any> 
    }) => {
      try {
        const { error } = await supabase
          .from('security_logs')
          .insert({
            user_id: user?.id || null,
            event_type: eventType,
            details: { description, ...metadata },
            ip_address: null, // Could be enhanced with actual IP detection
            user_agent: navigator.userAgent,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error logging security event:', error);
        // Don't throw error to prevent breaking the main functionality
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-logs'] });
    },
  });

  // Create a simple function that doesn't return a promise to avoid async issues
  const logSecurityEvent = ({ eventType, description, metadata = {} }: { 
    eventType: string; 
    description: string; 
    metadata?: Record<string, any> 
  }) => {
    // Fire and forget - don't wait for the result
    logSecurityEventMutation.mutate({ eventType, description, metadata });
  };

  return {
    securityLogs,
    isLoading,
    logSecurityEvent,
  };
};
