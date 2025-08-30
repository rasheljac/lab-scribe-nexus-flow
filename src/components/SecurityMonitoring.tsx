
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const SecurityMonitoring = () => {
  const { securityLogs, isLoading } = useSecurityMonitoring();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'auth_success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'auth_failure':
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'sms_sent':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'auth_success':
        return 'bg-green-100 text-green-800';
      case 'auth_failure':
      case 'suspicious_activity':
        return 'bg-red-100 text-red-800';
      case 'sms_sent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading security logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        {securityLogs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No security events recorded yet. Security monitoring will start once the database migration is applied.
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {securityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getEventIcon(log.event_type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getEventBadgeColor(log.event_type)}>
                        {log.event_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{log.event_description}</p>
                    {log.user_agent && (
                      <p className="text-xs text-muted-foreground">
                        {log.user_agent}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityMonitoring;
