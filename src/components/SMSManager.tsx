import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, Send, Clock, CheckCircle, XCircle, Trash2, Users } from "lucide-react";
import { useSMS } from "@/hooks/useSMS";
import { useContacts } from "@/hooks/useContacts";
import { format } from "date-fns";
import { SMSLog } from "@/types/sms";
import ContactsDialog from "./ContactsDialog";

const SMSManager = () => {
  const [message, setMessage] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendSMS, smsLogs, logsLoading, deleteSMS } = useSMS();
  const { contacts } = useContacts();

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    if (contactId === 'manual') {
      setMobileNumber('');
      return;
    }
    
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setMobileNumber(contact.mobile_number);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !mobileNumber.trim() || isSubmitting) {
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(mobileNumber)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sendSMS.mutateAsync({ message, mobile_number: mobileNumber });
      setMessage('');
      setMobileNumber('');
      setSelectedContact('');
    } catch (error) {
      console.error('Failed to send SMS:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSMS = async (logId: string) => {
    try {
      await deleteSMS.mutateAsync(logId);
    } catch (error) {
      console.error('Failed to delete SMS log:', error);
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

  const getSelectedContactName = () => {
    if (selectedContact && selectedContact !== 'manual') {
      const contact = contacts.find(c => c.id === selectedContact);
      return contact?.name;
    }
    return null;
  };

  const getRecipientDisplay = (log: SMSLog) => {
    // Try to find a contact with this mobile number
    const contact = contacts.find(c => c.mobile_number === log.mobile_number);
    return contact ? `${contact.name} (${log.mobile_number})` : log.mobile_number;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {getSelectedContactName() ? `Send SMS to ${getSelectedContactName()}` : 'Send SMS Message'}
            </CardTitle>
            <ContactsDialog />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendSMS} className="space-y-4">
            <div>
              <Label htmlFor="contact_select">Select Contact</Label>
              <Select value={selectedContact} onValueChange={handleContactSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contact or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Enter manually</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.mobile_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mobile_number">Mobile Number</Label>
              <Input
                id="mobile_number"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1234567890"
                required
                disabled={selectedContact !== '' && selectedContact !== 'manual'}
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
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || sendSMS.isPending || !message.trim() || !mobileNumber.trim()}
              className="w-full"
            >
              {(isSubmitting || sendSMS.isPending) ? (
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
                    <span className="font-medium">{getRecipientDisplay(log)}</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete SMS Log</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this SMS log? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSMS(log.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deleteSMS.isPending}
                            >
                              {deleteSMS.isPending ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
