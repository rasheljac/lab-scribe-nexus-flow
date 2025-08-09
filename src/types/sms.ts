
export interface SMSLog {
  id: string;
  user_id: string;
  mobile_number: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  api_response?: string;
  sent_at: string;
  created_at: string;
}
