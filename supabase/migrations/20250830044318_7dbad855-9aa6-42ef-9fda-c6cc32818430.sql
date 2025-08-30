
-- Create security_logs table for security monitoring
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own security logs
CREATE POLICY "Users can view their own security logs" 
  ON public.security_logs 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own security logs
CREATE POLICY "Users can create their own security logs" 
  ON public.security_logs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own security logs (for clearing logs)
CREATE POLICY "Users can delete their own security logs" 
  ON public.security_logs 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance on common queries
CREATE INDEX idx_security_logs_user_id_created_at ON public.security_logs (user_id, created_at DESC);
CREATE INDEX idx_security_logs_event_type ON public.security_logs (event_type);
