
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Eye } from "lucide-react";
import { useSecurityLogs } from "@/hooks/useSecurityLogs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SecurityLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SecurityLogsDialog = ({ open, onOpenChange }: SecurityLogsDialogProps) => {
  const { logs, isLoading, refreshLogs, exportLogs } = useSecurityLogs();
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const handleRefresh = async () => {
    await refreshLogs();
    toast({
      title: "Logs Refreshed",
      description: "Security logs have been updated.",
    });
  };

  const handleExport = () => {
    exportLogs(exportFormat);
    toast({
      title: "Export Started",
      description: `Security logs exported as ${exportFormat.toUpperCase()}.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            {logs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                    <span className="font-medium">{log.event}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">User: </span>
                    <span>{log.user}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IP: </span>
                    <span>{log.ip_address}</span>
                  </div>
                  <div className="md:col-span-1">
                    <span className="text-muted-foreground">Details: </span>
                    <span>{log.details}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityLogsDialog;
