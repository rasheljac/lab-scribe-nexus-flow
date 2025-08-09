
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { useSMS } from "@/hooks/useSMS";
import { format } from "date-fns";
import { SMSLog } from "@/types/sms";

const SMSManager = () => {
  const [message, setMessage] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const { sendSMS, smsLogs, logsLoading } = useSMS();

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !mobileNumber.trim()) {
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(mobileNumber)) {
      return;
    }

    try {
      await sendSMS.mutateAsync({ message, mobile_number: mobileNumber });
      setMessage('');
      setMobileNumber('');
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  const getStatusBadge = (status: SMSLog['status']) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send SMS Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendSMS} className="space-y-4">
            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1234567890"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Include country code (e.g., +1 for US numbers)
              </p>
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your SMS message here..."
                rows={4}
                maxLength={160}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {message.length}/160 characters
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={sendSMS.isPending || !message.trim() || !mobileNumber.trim()}
              className="w-full"
            >
              {sendSMS.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS History</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-4">Loading SMS history...</div>
          ) : smsLogs && smsLogs.length > 0 ? (
            <div className="space-y-4">
              {smsLogs.map((log: SMSLog) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{log.mobile_number}</span>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{log.message}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {format(new Date(log.sent_at), 'MMM dd, yyyy hh:mm a')}
                    </span>
                  </div>
                  {log.api_response && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground">
                        API Response
                      </summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                        {log.api_response}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No SMS messages sent yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSManager;
