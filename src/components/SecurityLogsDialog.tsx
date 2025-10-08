
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Eye } from "lucide-react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SecurityLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SecurityLogsDialog = ({ open, onOpenChange }: SecurityLogsDialogProps) => {
  const { securityLogs, isLoading } = useSecurityMonitoring();
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    const dataToExport = securityLogs.map(log => ({
      timestamp: new Date(log.created_at).toISOString(),
      event_type: log.event_type,
      description: log.event_description,
      user_id: log.user_id,
      ip_address: log.ip_address,
      user_agent: log.user_agent,
    }));

    let content = '';
    let filename = '';
    let mimeType = '';

    if (exportFormat === 'csv') {
      const headers = ['Timestamp', 'Event Type', 'Description', 'User ID', 'IP Address', 'User Agent'];
      const rows = dataToExport.map(log => [
        log.timestamp,
        log.event_type,
        log.description,
        log.user_id || '',
        log.ip_address || '',
        log.user_agent || '',
      ]);
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename = 'security-logs.csv';
      mimeType = 'text/csv';
    } else if (exportFormat === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      filename = 'security-logs.json';
      mimeType = 'application/json';
    } else {
      content = dataToExport.map(log => 
        `Timestamp: ${log.timestamp}\nEvent Type: ${log.event_type}\nDescription: ${log.description}\nUser ID: ${log.user_id}\nIP: ${log.ip_address}\nUser Agent: ${log.user_agent}\n---\n`
      ).join('\n');
      filename = 'security-logs.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Security logs exported as ${exportFormat.toUpperCase()}.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Security Logs
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">Text</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {securityLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No security logs available yet.
              </div>
            ) : (
              securityLogs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={getEventBadgeColor(log.event_type)}>
                        {log.event_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Description: </span>
                      <span>{log.event_description}</span>
                    </div>
                    {log.ip_address && (
                      <div>
                        <span className="text-muted-foreground">IP: </span>
                        <span>{log.ip_address}</span>
                      </div>
                    )}
                    {log.user_agent && (
                      <div className="text-xs text-muted-foreground">
                        {log.user_agent}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityLogsDialog;
