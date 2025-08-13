
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Get additional user profile data if available
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        avatar_url: profile?.avatar_url || '',
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
