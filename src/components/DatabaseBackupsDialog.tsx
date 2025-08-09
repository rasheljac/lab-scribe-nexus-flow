
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, Clock, HardDrive } from "lucide-react";
import { useDatabaseBackups } from "@/hooks/useDatabaseBackups";
import { useToast } from "@/hooks/use-toast";

interface DatabaseBackupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DatabaseBackupsDialog = ({ open, onOpenChange }: DatabaseBackupsDialogProps) => {
  const { backups, downloadBackup, deleteBackup } = useDatabaseBackups();
  const { toast } = useToast();

  const handleDownload = (backup: any) => {
    if (backup.status !== 'completed') {
      toast({
        title: "Download Not Available",
        description: "Backup must be completed before downloading.",
        variant: "destructive",
      });
      return;
    }
    
    downloadBackup(backup);
    toast({
      title: "Download Started",
      description: `Downloading ${backup.name}...`,
    });
  };

  const handleDelete = (backup: any) => {
    deleteBackup(backup.id);
    toast({
      title: "Backup Deleted",
      description: `${backup.name} has been deleted.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return <Clock className="w-3 h-3 animate-spin" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Database Backups
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups found
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{backup.name}</h3>
                      <Badge variant="secondary" className={getStatusColor(backup.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(backup.status)}
                          {backup.status}
                        </div>
                      </Badge>
                      <Badge variant="outline">
                        {backup.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(backup.created_at)}
                      </span>
                      <span>{backup.size}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(backup)}
                      disabled={backup.status !== 'completed'}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(backup)}
                      className="text-red-600 hover:text-red-700"
                      disabled={backup.status === 'in_progress'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseBackupsDialog;
