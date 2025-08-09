
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

    console.log('Sending SMS:', { mobile_number, message: message.substring(0, 50) + '...' });

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

    // For demo purposes, we'll assume admin check passes
    // In production, you'd check user roles here

    const parameters = new URLSearchParams({
      message: message,
      mobile_number: mobile_number,
      device: 'ea429d5beeeea26b'
    });

    const smsResponse = await fetch('https://docs.kapelczak.net/api/v1/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': '2JQY95FNU8LTSSOQLYBB4AWNTPXSLC3PRYI5HMRD'
      },
      body: parameters.toString()
    });

    const smsResult = await smsResponse.text();
    console.log('SMS API Response:', smsResult);

    if (!smsResponse.ok) {
      throw new Error(`SMS API error: ${smsResult}`);
    }

    // Log the SMS in database for audit trail
    const { error: logError } = await supabaseClient
      .from('sms_logs')
      .insert({
        user_id: user_id,
        mobile_number: mobile_number,
        message: message,
        status: 'sent',
        api_response: smsResult,
        sent_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging SMS:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        api_response: smsResult
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
