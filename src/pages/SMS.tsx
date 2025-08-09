
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SMSManager from "@/components/SMSManager";
import { MessageSquare } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const SMS = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <SidebarInset>
          <Header />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-8 w-8" />
                  SMS Messages
                </h2>
                <p className="text-muted-foreground">
                  Send SMS messages and view your message history
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              <SMSManager />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SMS;
