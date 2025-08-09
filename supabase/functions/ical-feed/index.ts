
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
    .replace(/\r/g, '')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length to prevent issues
}

function wrapICalLine(line: string): string {
  // iCal lines should be max 75 characters, wrap at 74 to account for space
  if (line.length <= 74) return line + '\r\n';
  
  let result = '';
  let remaining = line;
  
  while (remaining.length > 74) {
    result += remaining.substring(0, 74) + '\r\n ';
    remaining = remaining.substring(74);
  }
  result += remaining + '\r\n';
  
  return result;
}

function generateICalEvent(event: CalendarEvent): string {
  const startDate = formatDateForICal(event.start_time);
  const endDate = formatDateForICal(event.end_time);
  const created = formatDateForICal(event.created_at);
  const modified = formatDateForICal(event.updated_at);
  const dtstamp = formatDateForICal(new Date().toISOString());
  
  // Validate dates - if end is before start, make them equal
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const finalEndDate = endTime < startTime ? startDate : endDate;
  
  let icalEvent = '';
  icalEvent += wrapICalLine('BEGIN:VEVENT');
  icalEvent += wrapICalLine(`UID:${event.id}@laboratory-calendar.app`);
  icalEvent += wrapICalLine(`DTSTAMP:${dtstamp}`);
  icalEvent += wrapICalLine(`DTSTART:${startDate}`);
  icalEvent += wrapICalLine(`DTEND:${finalEndDate}`);
  icalEvent += wrapICalLine(`SUMMARY:${escapeICalText(event.title)}`);
  
  if (event.description && event.description.trim()) {
    icalEvent += wrapICalLine(`DESCRIPTION:${escapeICalText(event.description)}`);
  }
  
  if (event.location && event.location.trim()) {
    icalEvent += wrapICalLine(`LOCATION:${escapeICalText(event.location)}`);
  }
  
  icalEvent += wrapICalLine(`CREATED:${created}`);
  icalEvent += wrapICalLine(`LAST-MODIFIED:${modified}`);
  icalEvent += wrapICalLine('SEQUENCE:0');
  icalEvent += wrapICalLine('STATUS:CONFIRMED');
  icalEvent += wrapICalLine('TRANSP:OPAQUE');
  icalEvent += wrapICalLine('END:VEVENT');
  
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

    // Generate iCal content with proper headers and line endings
    let icalContent = '';
    icalContent += wrapICalLine('BEGIN:VCALENDAR');
    icalContent += wrapICalLine('VERSION:2.0');
    icalContent += wrapICalLine('PRODID:-//Laboratory Calendar//Laboratory Management System v1.0//EN');
    icalContent += wrapICalLine('CALSCALE:GREGORIAN');
    icalContent += wrapICalLine('METHOD:PUBLISH');
    icalContent += wrapICalLine('X-WR-CALNAME:Laboratory Calendar');
    icalContent += wrapICalLine('X-WR-CALDESC:Laboratory Management System Calendar');
    icalContent += wrapICalLine('X-WR-TIMEZONE:UTC');
    icalContent += wrapICalLine('X-PUBLISHED-TTL:PT1H');

    // Add events - filter out any with invalid data
    if (events && events.length > 0) {
      const validEvents = events.filter(event => 
        event.title && 
        event.start_time && 
        event.end_time &&
        !isNaN(new Date(event.start_time).getTime()) &&
        !isNaN(new Date(event.end_time).getTime())
      );
      
      console.log(`Processing ${validEvents.length} valid events out of ${events.length} total`);
      
      validEvents.forEach((event: CalendarEvent, index: number) => {
        try {
          console.log(`Processing event ${index + 1}: ${event.title}`);
          icalContent += generateICalEvent(event);
        } catch (eventError) {
          console.error(`Error processing event ${event.id}:`, eventError);
          // Skip this event but continue with others
        }
      });
    }

    icalContent += wrapICalLine('END:VCALENDAR');

    console.log('Returning iCal content, length:', icalContent.length);

    return new Response(icalContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="laboratory-calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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
