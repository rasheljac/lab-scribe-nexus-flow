
-- Add SMS reminder fields to calendar_events table
ALTER TABLE calendar_events 
ADD COLUMN sms_reminder_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN sms_reminder_phone TEXT,
ADD COLUMN sms_reminder_sent BOOLEAN DEFAULT FALSE;
