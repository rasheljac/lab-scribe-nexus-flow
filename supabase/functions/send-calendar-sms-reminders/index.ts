
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log('Checking for calendar events that need SMS reminders...');

    // Get events that need SMS reminders sent
    const { data: events, error: eventsError } = await supabaseClient
      .from('calendar_events')
      .select('*')
      .eq('sms_reminder_enabled', true)
      .eq('sms_reminder_sent', false)
      .eq('status', 'scheduled')
      .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Within 24 hours
      .gt('start_time', new Date().toISOString()); // Future events only

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`Found ${events?.length || 0} events to check for SMS reminders`);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No events need SMS reminders' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let remindersSent = 0;

    for (const event of events) {
      try {
        const eventStart = new Date(event.start_time);
        const reminderTime = new Date(eventStart.getTime() - (event.sms_reminder_minutes_before || 15) * 60 * 1000);
        const now = new Date();

        // Check if it's time to send the reminder
        if (now >= reminderTime) {
          console.log(`Sending SMS reminder for event: ${event.title}`);

          // Prepare SMS message
          const message = `Reminder: ${event.title} is scheduled for ${eventStart.toLocaleString()}${event.location ? ` at ${event.location}` : ''}`;

          // Send SMS using the existing send-sms function
          const smsResponse = await fetch('https://docs.kapelczak.net/api/v1/sms/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'apikey': '2JQY95FNU8LTSSOQLYBB4AWNTPXSLC3PRYI5HMRD'
            },
            body: new URLSearchParams({
              message: message,
              mobile_number: event.sms_reminder_phone,
              device: 'ea429d5beeeea26b'
            }).toString()
          });

          const smsResult = await smsResponse.text();
          console.log('SMS API Response:', smsResult);

          if (smsResponse.ok) {
            // Mark SMS reminder as sent
            const { error: updateError } = await supabaseClient
              .from('calendar_events')
              .update({ 
                sms_reminder_sent: true,
                last_reminder_sent: new Date().toISOString()
              })
              .eq('id', event.id);

            if (updateError) {
              console.error('Error updating event reminder status:', updateError);
            } else {
              remindersSent++;
              console.log(`SMS reminder sent for event: ${event.title}`);

              // Log the SMS for audit trail
              const { error: logError } = await supabaseClient
                .from('sms_logs')
                .insert({
                  user_id: event.user_id,
                  mobile_number: event.sms_reminder_phone,
                  message: message,
                  status: 'sent',
                  api_response: smsResult,
                  sent_at: new Date().toISOString()
                });

              if (logError) {
                console.error('Error logging SMS:', logError);
              }
            }
          } else {
            console.error(`Failed to send SMS for event ${event.title}:`, smsResult);
          }
        }
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${events.length} events, sent ${remindersSent} SMS reminders`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in send-calendar-sms-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
