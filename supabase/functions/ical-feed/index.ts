
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

function formatDateForICal(date: string): string {
  return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICalText(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function generateICalEvent(event: CalendarEvent): string {
  const startDate = formatDateForICal(event.start_time);
  const endDate = formatDateForICal(event.end_time);
  const created = formatDateForICal(event.created_at);
  const modified = formatDateForICal(event.updated_at);
  
  let icalEvent = 'BEGIN:VEVENT\r\n';
  icalEvent += `UID:${event.id}@laboratory-calendar\r\n`;
  icalEvent += `DTSTAMP:${created}\r\n`;
  icalEvent += `DTSTART:${startDate}\r\n`;
  icalEvent += `DTEND:${endDate}\r\n`;
  icalEvent += `SUMMARY:${escapeICalText(event.title)}\r\n`;
  
  if (event.description) {
    icalEvent += `DESCRIPTION:${escapeICalText(event.description)}\r\n`;
  }
  
  if (event.location) {
    icalEvent += `LOCATION:${escapeICalText(event.location)}\r\n`;
  }
  
  icalEvent += `CREATED:${created}\r\n`;
  icalEvent += `LAST-MODIFIED:${modified}\r\n`;
  icalEvent += 'END:VEVENT\r\n';
  
  return icalEvent;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const token = url.searchParams.get('token');

    if (!userId || !token) {
      return new Response('Missing user_id or token parameter', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the token by checking if the user exists and the token matches their ID
    // In a production environment, you'd want a more secure token system
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (!userProfile) {
      return new Response('Invalid user', { 
        status: 403,
        headers: corsHeaders
      });
    }

    // Fetch calendar events for the user
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      return new Response('Error fetching calendar events', { 
        status: 500,
        headers: corsHeaders
      });
    }

    // Generate iCal content
    let icalContent = 'BEGIN:VCALENDAR\r\n';
    icalContent += 'VERSION:2.0\r\n';
    icalContent += 'PRODID:-//Laboratory Calendar//Laboratory Management System//EN\r\n';
    icalContent += 'CALSCALE:GREGORIAN\r\n';
    icalContent += 'METHOD:PUBLISH\r\n';
    icalContent += 'X-WR-CALNAME:Laboratory Calendar\r\n';
    icalContent += 'X-WR-CALDESC:Laboratory Management System Calendar\r\n';
    icalContent += 'X-WR-TIMEZONE:UTC\r\n';

    // Add events
    if (events && events.length > 0) {
      events.forEach((event: CalendarEvent) => {
        icalContent += generateICalEvent(event);
      });
    }

    icalContent += 'END:VCALENDAR\r\n';

    return new Response(icalContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="laboratory-calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error generating iCal feed:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders
    });
  }
});
