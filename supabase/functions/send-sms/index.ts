
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  message: string;
  mobile_number: string;
  user_id: string;
}

// Simple in-memory cache to prevent duplicate requests
const requestCache = new Map<string, number>();
const CACHE_DURATION = 10000; // 10 seconds

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { message, mobile_number, user_id }: SMSRequest = await req.json();

    if (!message || !mobile_number || !user_id) {
      return new Response(
        JSON.stringify({ error: "Message, mobile number, and user ID are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get SMS API key from Supabase secrets
    const smsApiKey = Deno.env.get("SMS_API_KEY");
    if (!smsApiKey) {
      console.error('SMS_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'SMS service configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create a unique request identifier to prevent duplicates
    const requestId = `${user_id}-${mobile_number}-${message.substring(0, 50)}-${Date.now()}`;
    const truncatedRequestId = `${user_id}-${mobile_number}-${message.substring(0, 50)}`;
    
    // Check if this exact request was made recently
    const cachedTime = requestCache.get(truncatedRequestId);
    const now = Date.now();
    
    if (cachedTime && (now - cachedTime) < CACHE_DURATION) {
      console.log('Duplicate request detected, rejecting:', truncatedRequestId);
      return new Response(
        JSON.stringify({ error: 'Duplicate request detected. Please wait before sending another identical message.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Cache this request
    requestCache.set(truncatedRequestId, now);

    // Clean up old cache entries
    for (const [key, time] of requestCache.entries()) {
      if (now - time > CACHE_DURATION) {
        requestCache.delete(key);
      }
    }

    console.log('Sending SMS:', { mobile_number, message: message.substring(0, 50) + '...', requestId });

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Log security event for SMS send attempt
    const { error: logError } = await supabaseClient
      .from('security_logs')
      .insert({
        user_id: user_id,
        event_type: 'sms_send_attempt',
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: {
          mobile_number: mobile_number,
          message_length: message.length,
          request_id: requestId
        }
      });

    if (logError) {
      console.error('Failed to log security event:', logError);
    }

    const parameters = new URLSearchParams({
      message: message,
      mobile_number: mobile_number,
      device: 'ea429d5beeeea26b'
    });

    const smsResponse = await fetch('https://docs.kapelczak.net/api/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': smsApiKey
      },
      body: parameters.toString()
    });

    const smsResult = await smsResponse.text();
    console.log('SMS API Response:', smsResult);

    if (!smsResponse.ok) {
      // Log failed SMS attempt
      await supabaseClient
        .from('security_logs')
        .insert({
          user_id: user_id,
          event_type: 'sms_send_failed',
          ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          details: {
            mobile_number: mobile_number,
            error: smsResult,
            request_id: requestId
          }
        });

      throw new Error(`SMS API error: ${smsResult}`);
    }

    // Log the SMS in database for audit trail with request ID
    const { error: smsLogError } = await supabaseClient
      .from('sms_logs')
      .insert({
        user_id: user_id,
        mobile_number: mobile_number,
        message: message,
        status: 'sent',
        api_response: smsResult,
        sent_at: new Date().toISOString()
      });

    if (smsLogError) {
      console.error('Error logging SMS:', smsLogError);
    }

    // Log successful SMS send
    await supabaseClient
      .from('security_logs')
      .insert({
        user_id: user_id,
        event_type: 'sms_send_success',
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: {
          mobile_number: mobile_number,
          message_length: message.length,
          request_id: requestId
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        api_response: smsResult,
        request_id: requestId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
