import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface iDriveE2Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint: string;
}

// Simple encryption key derivation for credentials (basic protection)
function deriveKey(userId: string): string {
  // Use a combination of user ID and environment secret for key derivation
  const baseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return btoa(userId + baseKey).substring(0, 32);
}

// Basic encryption/decryption for sensitive data
async function encryptData(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').substring(0, 32));
  const dataArray = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataArray
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encryptedData: string, key: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key.padEnd(32, '0').substring(0, 32));
    
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt credentials');
  }
}

async function getE2ConfigFromUserPreferences(supabaseClient: any, userId: string): Promise<iDriveE2Config | null> {
  console.log('Fetching iDrive E2 config for user:', userId);
  
  try {
    const { data: userPrefs, error } = await supabaseClient
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error || !userPrefs?.preferences?.s3Config) {
      console.error('No iDrive E2 config found in user preferences');
      return null;
    }

    const config = userPrefs.preferences.s3Config;
    
    if (!config.enabled) {
      console.error('iDrive E2 config is disabled');
      return null;
    }

    // Normalize endpoint - ensure it starts with https://
    let endpoint = config.endpoint || '';
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    // Decrypt sensitive credentials if they're encrypted
    let accessKeyId = config.access_key_id;
    let secretAccessKey = config.secret_access_key;
    
    if (config.encrypted) {
      const encryptionKey = deriveKey(userId);
      accessKeyId = await decryptData(config.access_key_id, encryptionKey);
      secretAccessKey = await decryptData(config.secret_access_key, encryptionKey);
    }

    const e2Config: iDriveE2Config = {
      accessKeyId,
      secretAccessKey,
      region: config.region || 'us-east-1',
      bucketName: config.bucket_name,
      endpoint: endpoint
    };

    // Validate required fields
    if (!e2Config.accessKeyId || !e2Config.secretAccessKey || !e2Config.bucketName || !e2Config.endpoint) {
      console.error('Missing required iDrive E2 configuration fields');
      return null;
    }

    console.log('iDrive E2 config loaded successfully:', {
      endpoint: e2Config.endpoint,
      bucket: e2Config.bucketName,
      region: e2Config.region,
      hasAccessKey: !!e2Config.accessKeyId,
      hasSecretKey: !!e2Config.secretAccessKey
    });
    
    return e2Config;
  } catch (error) {
    console.error('Error fetching iDrive E2 config:', error);
    return null;
  }
}

// Simple HMAC-SHA256 implementation
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = new Uint8Array(signature);
  return btoa(String.fromCharCode(...signatureArray));
}

// Generate signed URL for downloads
async function generateDownloadUrl(objectKey: string, config: iDriveE2Config, expirationSeconds: number = 3600): Promise<string> {
  const method = 'GET';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substr(0, 8);
  
  const canonicalUri = `/${objectKey}`;
  const canonicalQuerystring = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(config.accessKeyId)}%2F${dateStamp}%2F${config.region}%2Fs3%2Faws4_request&X-Amz-Date=${amzDate}&X-Amz-Expires=${expirationSeconds}&X-Amz-SignedHeaders=host`;
  const canonicalHeaders = `host:${config.endpoint.replace('https://', '')}\n`;
  const signedHeaders = 'host';
  
  const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('')).then(buffer => 
    Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  );
  
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)).then(buffer => 
    Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  )}`;
  
  const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp, config.region, 's3');
  const signature = await hmacSha256(signingKey, stringToSign);
  
  return `${config.endpoint}/${objectKey}?${canonicalQuerystring}&X-Amz-Signature=${signature}`;
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<string> {
  const kDate = await hmacSha256(`AWS4${key}`, dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

// Create iDrive E2 compatible request
async function createE2Request(
  method: string,
  objectKey: string,
  config: iDriveE2Config,
  contentType?: string
): Promise<{ url: string; headers: Record<string, string> }> {
  console.log('Creating iDrive E2 request:', { method, objectKey, endpoint: config.endpoint });
  
  try {
    const fullUrl = `${config.endpoint}/${config.bucketName}/${objectKey}`;
    
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    const stringToSign = `${method}\n\n${contentType || ''}\n${now.toUTCString()}\n/${config.bucketName}/${objectKey}`;
    
    console.log('String to sign:', stringToSign);
    
    const signature = await hmacSha256(config.secretAccessKey, stringToSign);
    
    const authorization = `AWS ${config.accessKeyId}:${signature}`;
    
    const headers: Record<string, string> = {
      'Authorization': authorization,
      'Date': now.toUTCString(),
    };
    
    if (method === 'PUT' && contentType) {
      headers['Content-Type'] = contentType;
    }
    
    console.log('Generated request:', {
      url: fullUrl,
      headers: Object.keys(headers),
      method
    });
    
    return { url: fullUrl, headers };
  } catch (error) {
    console.error('Error creating iDrive E2 request:', error);
    throw new Error(`Failed to create iDrive E2 request: ${error.message}`);
  }
}

async function uploadToE2(file: File, key: string, config: iDriveE2Config): Promise<string> {
  console.log('Starting iDrive E2 upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type, 
    key, 
    bucket: config.bucketName,
    endpoint: config.endpoint,
    fullConfig: config
  });
  
  try {
    const { url, headers } = await createE2Request('PUT', key, config, file.type);
    
    console.log('Uploading to URL:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: file
    });
    
    console.log('Upload response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        url
      });
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${responseText}`);
    }
    
    console.log('Upload successful to iDrive E2');
    return key;
  } catch (error) {
    console.error('iDrive E2 upload error:', error);
    throw error;
  }
}

async function deleteFromE2(key: string, config: iDriveE2Config): Promise<void> {
  console.log('Starting iDrive E2 delete:', { key, bucket: config.bucketName });
  
  try {
    const { url, headers } = await createE2Request('DELETE', key, config);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    console.log('Delete response status:', response.status);
    
    if (!response.ok && response.status !== 404) {
      const responseText = await response.text();
      console.error('Delete failed:', {
        status: response.status,
        statusText: response.statusText,
        responseText
      });
      throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
    }
    
    console.log('Delete successful or file not found');
  } catch (error) {
    console.error('iDrive E2 delete error:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Log security event for file operation attempt
    const { error: logError } = await supabaseClient
      .from('security_logs')
      .insert({
        user_id: user.id,
        event_type: 's3_operation_attempt',
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: {
          method: req.method,
          url: req.url
        }
      });

    if (logError) {
      console.error('Failed to log security event:', logError);
    }

    // Get iDrive E2 config from user preferences
    const e2Config = await getE2ConfigFromUserPreferences(supabaseClient, user.id);
    if (!e2Config) {
      console.error('iDrive E2 configuration not found or invalid');
      return new Response(JSON.stringify({ 
        error: 'iDrive E2 configuration not found or invalid. Please check your settings and ensure all required fields are filled. Make sure your endpoint is set to: https://v2j1.c1.e2-9.dev' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const noteId = formData.get('noteId') as string;

      console.log('Upload request - File:', file?.name, 'Note ID:', noteId);

      if (!file || !noteId) {
        return new Response(JSON.stringify({ error: 'Missing file or noteId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File size exceeds 50MB limit' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const fileExt = file.name.split('.').pop();
      const objectKey = `${user.id}/${noteId}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading to iDrive E2 with key:', objectKey);
      
      try {
        // Upload to iDrive E2
        const uploadedKey = await uploadToE2(file, objectKey, e2Config);
        
        // Determine which table to save to based on noteId prefix
        let data, error;
        if (noteId.startsWith('user-file-')) {
          // Save to user_files table for Files page uploads
          const { data: fileData, error: fileError } = await supabaseClient
            .from('user_files')
            .insert([{
              user_id: user.id,
              filename: file.name,
              file_path: `${e2Config.endpoint}/${e2Config.bucketName}/${uploadedKey}`,
              file_type: file.type,
              file_size: file.size,
            }])
            .select()
            .single();
          data = fileData;
          error = fileError;
        } else {
          // Save to experiment_note_attachments for experiment note uploads
          const { data: noteData, error: noteError } = await supabaseClient
            .from('experiment_note_attachments')
            .insert([{
              note_id: noteId,
              user_id: user.id,
              filename: file.name,
              file_path: uploadedKey,
              file_type: file.type,
              file_size: file.size,
            }])
            .select()
            .single();
          data = noteData;
          error = noteError;
        }

        if (error) {
          console.error('Database insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }

        // Log successful upload
        await supabaseClient
          .from('security_logs')
          .insert({
            user_id: user.id,
            event_type: 's3_upload_success',
            ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            details: {
              filename: file.name,
              fileSize: file.size,
              objectKey: uploadedKey
            }
          });

        console.log('Upload and database insert successful:', data);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (uploadError) {
        console.error('Upload process failed:', uploadError);
        
        // Log failed upload
        await supabaseClient
          .from('security_logs')
          .insert({
            user_id: user.id,
            event_type: 's3_upload_failed',
            ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            details: {
              filename: file.name,
              error: uploadError.message
            }
          });

        return new Response(JSON.stringify({ 
          error: `Upload failed: ${uploadError.message}`,
          details: uploadError.toString()
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    } else {
      // Handle JSON requests (delete)
      const body = await req.json();
      console.log('JSON request body:', body);
      
      if (body.attachmentId) {
        // Delete operation
        console.log('Delete request for attachment:', body.attachmentId);
        
        // Try to get attachment from both tables
        let attachment = null;
        let isUserFile = false;
        
        // First try user_files table
        const { data: userFile, error: userFileError } = await supabaseClient
          .from('user_files')
          .select('*')
          .eq('id', body.attachmentId)
          .eq('user_id', user.id)
          .single();
        
        if (userFile && !userFileError) {
          attachment = userFile;
          isUserFile = true;
        } else {
          // Try experiment_note_attachments table
          const { data: noteAttachment, error: noteAttachmentError } = await supabaseClient
            .from('experiment_note_attachments')
            .select('*')
            .eq('id', body.attachmentId)
            .eq('user_id', user.id)
            .single();
            
          if (noteAttachment && !noteAttachmentError) {
            attachment = noteAttachment;
            isUserFile = false;
          }
        }

        if (!attachment) {
          console.error('Attachment not found in any table');
          return new Response(JSON.stringify({ error: 'Attachment not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('Deleting from iDrive E2:', attachment.file_path);
        
        try {
          // For user files, the file_path already includes the endpoint, so extract just the key
          let fileKey = attachment.file_path;
          if (isUserFile && fileKey.includes(e2Config.endpoint)) {
            fileKey = fileKey.replace(`${e2Config.endpoint}/`, '');
          }
          
          // Delete from iDrive E2
          await deleteFromE2(fileKey, e2Config);
          console.log('iDrive E2 delete successful');
        } catch (e2Error) {
          console.error('iDrive E2 delete error (continuing with database delete):', e2Error);
          // Continue with database deletion even if iDrive E2 delete fails
        }
        
        // Delete record from appropriate database table
        const tableName = isUserFile ? 'user_files' : 'experiment_note_attachments';
        const { error: deleteError } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', body.attachmentId);

        if (deleteError) {
          console.error('Database delete error:', deleteError);
          throw new Error(`Database delete error: ${deleteError.message}`);
        }

        // Log successful delete
        await supabaseClient
          .from('security_logs')
          .insert({
            user_id: user.id,
            event_type: 's3_delete_success',
            ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            details: {
              attachmentId: body.attachmentId,
              filePath: attachment.file_path
            }
          });

        console.log('Delete operation completed successfully');
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } else if (body.action === 'download' && body.attachmentId) {
        // Download operation - generate signed URL
        console.log('Download request for attachment:', body.attachmentId);
        
        // Get attachment details
        const { data: attachment, error: fetchError } = await supabaseClient
          .from('experiment_attachments')
          .select('*')
          .eq('id', body.attachmentId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !attachment) {
          console.error('Attachment not found:', fetchError);
          return new Response(JSON.stringify({ error: 'Attachment not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        try {
          // Generate signed URL for download (valid for 1 hour)
          const downloadUrl = await generateDownloadUrl(attachment.file_path, e2Config, 3600);
          
          // Log download request
          await supabaseClient
            .from('security_logs')
            .insert({
              user_id: user.id,
              event_type: 's3_download_requested',
              ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown',
              user_agent: req.headers.get('user-agent') || 'unknown',
              details: {
                attachmentId: body.attachmentId,
                filename: attachment.filename,
                filePath: attachment.file_path
              }
            });

          console.log('Download URL generated successfully');
          return new Response(JSON.stringify({ 
            downloadUrl,
            filename: attachment.filename,
            contentType: attachment.file_type 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (downloadError) {
          console.error('Download URL generation failed:', downloadError);
          return new Response(JSON.stringify({ 
            error: `Download URL generation failed: ${downloadError.message}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      } else {
        return new Response(JSON.stringify({ error: 'Invalid request body. Expected attachmentId for delete operation or action=download with attachmentId for download operation.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
