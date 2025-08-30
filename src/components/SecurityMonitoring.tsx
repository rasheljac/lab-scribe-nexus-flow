
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Download, Trash2, RefreshCw, Eye } from "lucide-react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { format } from "date-fns";

const SecurityMonitoring = () => {
  const { 
    securityEvents, 
    eventsLoading, 
    clearSecurityLogs, 
    exportSecurityLogs,
    getEventTypeDisplay 
  } = useSecurityMonitoring();

  const handleExport = (format: 'csv' | 'json') => {
    exportSecurityLogs(format);
  };

  const handleClearLogs = async () => {
    try {
      await clearSecurityLogs.mutateAsync();
    } catch (error) {
      console.error('Failed to clear security logs:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Monitoring
            </CardTitle>
            <div className="flex gap-2">
              <Select onValueChange={(format) => handleExport(format as 'csv' | 'json')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      JSON
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Security Logs</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all security logs? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearLogs}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={clearSecurityLogs.isPending}
                    >
                      {clearSecurityLogs.isPending ? 'Clearing...' : 'Clear Logs'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading security events...
            </div>
          ) : securityEvents && securityEvents.length > 0 ? (
            <div className="space-y-4">
              {securityEvents.map((event) => {
                const eventDisplay = getEventTypeDisplay(event.event_type);
                return (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={eventDisplay.color}>
                          {eventDisplay.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(event.created_at), 'MMM dd, yyyy hh:mm:ss a')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        IP: {event.ip_address || 'unknown'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      User Agent: {event.user_agent || 'unknown'}
                    </div>
                    
                    {event.details && Object.keys(event.details as object).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Event Details
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded yet</p>
              <p className="text-sm">Security events will appear here when they occur</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
