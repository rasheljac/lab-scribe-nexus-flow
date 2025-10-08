import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Monitor } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ActiveSessionsDialog = () => {
  const { session } = useAuth();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Sessions</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogDescription>
            Manage your active login sessions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {session ? (
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Last activity: {formatDistanceToNow(new Date(session.user.last_sign_in_at || new Date()), { addSuffix: true })}
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No active sessions
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
