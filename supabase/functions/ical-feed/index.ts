
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
  const dtstamp = formatDateForICal(new Date().toISOString());
  
  let icalEvent = 'BEGIN:VEVENT\r\n';
  icalEvent += `UID:${event.id}@laboratory-calendar.app\r\n`;
  icalEvent += `DTSTAMP:${dtstamp}\r\n`;
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
  icalEvent += `SEQUENCE:0\r\n`;
  icalEvent += `STATUS:CONFIRMED\r\n`;
  icalEvent += `TRANSP:OPAQUE\r\n`;
  icalEvent += 'END:VEVENT\r\n';
  
  return icalEvent;
}

Deno.serve(async (req) => {
  console.log('iCal feed request received:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const token = url.searchParams.get('token');

    console.log('Request parameters:', { userId, token });

    if (!userId || !token) {
      console.error('Missing required parameters');
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
    console.log('Verifying user...');
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (!userProfile || token !== userId) {
      console.error('Invalid user or token');
      return new Response('Invalid user or token', { 
        status: 403,
        headers: corsHeaders
      });
    }

    console.log('User verified, fetching events...');
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

    console.log(`Found ${events?.length || 0} events`);

    // Generate iCal content with proper headers
    let icalContent = 'BEGIN:VCALENDAR\r\n';
    icalContent += 'VERSION:2.0\r\n';
    icalContent += 'PRODID:-//Laboratory Calendar//Laboratory Management System v1.0//EN\r\n';
    icalContent += 'CALSCALE:GREGORIAN\r\n';
    icalContent += 'METHOD:PUBLISH\r\n';
    icalContent += 'X-WR-CALNAME:Laboratory Calendar\r\n';
    icalContent += 'X-WR-CALDESC:Laboratory Management System Calendar\r\n';
    icalContent += 'X-WR-TIMEZONE:UTC\r\n';
    icalContent += 'X-PUBLISHED-TTL:PT1H\r\n';

    // Add events
    if (events && events.length > 0) {
      events.forEach((event: CalendarEvent) => {
        icalContent += generateICalEvent(event);
      });
    }

    icalContent += 'END:VCALENDAR\r\n';

    console.log('Returning iCal content, length:', icalContent.length);

    return new Response(icalContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="laboratory-calendar.ics"',
        'Cache-Control': 'public, max-age=3600',
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
