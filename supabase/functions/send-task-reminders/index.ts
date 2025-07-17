
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  due_date: string;
  category: string;
  user_id: string;
  last_reminder_sent: string | null;
}

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
}

interface SMTPConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
  from_email: string;
  use_tls: boolean;
  enabled: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { user_id, test_mode, test_email } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Processing task reminders for user:', user_id, 'test_mode:', test_mode);

    // Get user profile for email
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('user_id', user_id)
      .single();

    if (profileError || !userProfile?.email) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Found user profile:', userProfile.email);

    // Get SMTP configuration from user preferences
    const { data: preferences, error: prefsError } = await supabaseClient
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', user_id)
      .single();

    if (prefsError || !preferences?.preferences?.smtpConfig?.enabled) {
      console.error('SMTP configuration error:', prefsError);
      return new Response(
        JSON.stringify({ error: 'SMTP not configured or disabled' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const smtpConfig: SMTPConfig = preferences.preferences.smtpConfig;
    console.log('SMTP config loaded:', { host: smtpConfig.host, port: smtpConfig.port, username: smtpConfig.username });

    // Get tasks due in the next 3 days that haven't had reminders sent recently
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user_id)
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])
      .neq('status', 'completed')
      .or(`last_reminder_sent.is.null,last_reminder_sent.lt.${oneDayAgo.toISOString()}`);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Found tasks:', tasks?.length || 0);

    if (!tasks || tasks.length === 0) {
      // In test mode, create a sample task for testing
      if (test_mode) {
        const sampleTask: Task = {
          id: 'test-task-1',
          title: 'Test Task - SMTP Configuration Test',
          description: 'This is a test task to verify SMTP configuration is working correctly.',
          priority: 'medium',
          status: 'pending',
          assignee: userProfile.email,
          due_date: new Date().toISOString().split('T')[0],
          category: 'System Test',
          user_id: user_id,
          last_reminder_sent: null
        };
        
        console.log('Using sample task for testing');
        // Use the sample task array
        const testTasks = [sampleTask];
        
        // Generate email content
        const userName = userProfile.first_name 
          ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
          : userProfile.email?.split('@')[0] || 'User';

        const emailHtml = generateTaskReminderEmail(userName, testTasks);
        const recipientEmail = test_email || userProfile.email;

        // Send test email
        await sendEmail(smtpConfig, recipientEmail, testTasks, emailHtml);
        
        return new Response(
          JSON.stringify({ 
            message: 'Test email sent successfully',
            tasks_count: 1,
            recipient: recipientEmail
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ message: 'No upcoming tasks found that need reminders' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate email content
    const userName = userProfile.first_name 
      ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
      : userProfile.email?.split('@')[0] || 'User';

    const emailHtml = generateTaskReminderEmail(userName, tasks);
    const recipientEmail = test_mode && test_email ? test_email : userProfile.email;

    // Send email using SMTP
    await sendEmail(smtpConfig, recipientEmail, tasks, emailHtml);

    // Update last_reminder_sent for all tasks (unless in test mode)
    if (!test_mode) {
      const taskIds = tasks.map(task => task.id);
      const { error: updateError } = await supabaseClient
        .from('tasks')
        .update({ last_reminder_sent: new Date().toISOString() })
        .in('id', taskIds);

      if (updateError) {
        console.error('Error updating reminder timestamps:', updateError);
      }
    }

    console.log(`Task reminder email sent successfully to ${recipientEmail}`);
    
    return new Response(
      JSON.stringify({ 
        message: 'Task reminders sent successfully',
        tasks_count: tasks.length,
        recipient: recipientEmail
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in send-task-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

async function sendEmail(smtpConfig: SMTPConfig, recipientEmail: string, tasks: Task[], emailHtml: string) {
  let client: SMTPClient | null = null;
  
  try {
    // Ensure port is a number
    const port = typeof smtpConfig.port === 'string' ? parseInt(smtpConfig.port, 10) : smtpConfig.port;
    
    console.log('Creating SMTP client with config:', {
      host: smtpConfig.host,
      port: port,
      username: smtpConfig.username,
      tls: smtpConfig.use_tls
    });

    client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: port,
        tls: smtpConfig.use_tls,
        auth: {
          username: smtpConfig.username,
          password: smtpConfig.password,
        },
      },
    });

    // Create plain text version from HTML
    const plainTextContent = generatePlainTextContent(tasks);

    const emailOptions = {
      from: smtpConfig.from_email,
      to: recipientEmail,
      subject: `Task Reminders - ${tasks.length} upcoming task${tasks.length > 1 ? 's' : ''}`,
      content: plainTextContent,
      html: emailHtml,
    };

    console.log('Sending email with options:', {
      from: emailOptions.from,
      to: emailOptions.to,
      subject: emailOptions.subject,
      hasHtml: !!emailOptions.html,
      hasContent: !!emailOptions.content
    });

    await client.send(emailOptions);
    console.log('Email sent successfully');
    
  } catch (emailError) {
    console.error('Error sending email:', emailError);
    throw new Error(`Failed to send email: ${emailError.message}`);
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing SMTP client:', closeError);
      }
    }
  }
}

function generatePlainTextContent(tasks: Task[]): string {
  const userName = 'User';
  let content = `Hello ${userName},\n\n`;
  content += `You have ${tasks.length} upcoming task${tasks.length > 1 ? 's' : ''} that require your attention:\n\n`;
  
  tasks.forEach((task, index) => {
    const dueDate = new Date(task.due_date).toLocaleDateString();
    content += `${index + 1}. ${task.title}\n`;
    content += `   Due Date: ${dueDate}\n`;
    content += `   Priority: ${task.priority}\n`;
    content += `   Status: ${task.status.replace('_', ' ')}\n`;
    content += `   Category: ${task.category}\n`;
    if (task.description) {
      content += `   Description: ${task.description}\n`;
    }
    content += `\n`;
  });
  
  content += `Please review and complete these tasks before their due dates.\n\n`;
  content += `Best regards,\nKapelczak Laboratory`;
  
  return content;
}

function generateTaskReminderEmail(userName: string, tasks: Task[]): string {
  const currentYear = new Date().getFullYear();
  
  let tasksHtml = '';
  for (const task of tasks) {
    const dueDate = new Date(task.due_date).toLocaleDateString();
    const priorityColor = task.priority === 'high' ? '#dc3545' : task.priority === 'medium' ? '#ffc107' : '#28a745';
    const statusColor = task.status === 'pending' ? '#6c757d' : '#007bff';
    
    tasksHtml += `
      <div style="background-color: #f8f9fa; border-left: 4px solid ${priorityColor}; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${task.title}</h3>
        <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${dueDate}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong> <span style="color: ${priorityColor}; text-transform: capitalize;">${task.priority}</span></p>
        <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: ${statusColor}; text-transform: capitalize;">${task.status.replace('_', ' ')}</span></p>
        <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${task.category}</p>
        ${task.description ? `<p style="margin: 10px 0 0 0; color: #333;">${task.description}</p>` : ''}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Task Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .btn { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Task Reminder</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Kapelczak Laboratory</p>
        </div>
        <div class="content">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">You have upcoming tasks that require your attention:</p>
            
            ${tasksHtml}
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">Please review and complete these tasks before their due dates.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/tasks" class="btn" style="color: white; text-decoration: none;">View All Tasks</a>
        </div>
        <div class="footer">
            <p style="margin: 0;">© ${currentYear} Kapelczak Laboratory. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
}

serve(handler);
