
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Database, Server, Shield } from "lucide-react";
import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const { toast } = useToast();
  
  // General Settings State
  const [systemName, setSystemName] = useState("Lab Management System");
  const [adminEmail, setAdminEmail] = useState("admin@lab.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Database Settings State
  const [autoBackups, setAutoBackups] = useState(true);
  const [backupRetention, setBackupRetention] = useState("30");

  // Server Settings State
  const [maxUsers, setMaxUsers] = useState("100");
  const [sessionTimeout, setSessionTimeout] = useState("60");

  // Security Settings State
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);
  const [logUserActivities, setLogUserActivities] = useState(true);

  const handleSaveGeneral = () => {
    // In a real app, this would save to backend
    console.log("Saving general settings:", {
      systemName,
      adminEmail,
      maintenanceMode,
      emailNotifications
    });
    toast({
      title: "Settings Saved",
      description: "General settings have been saved successfully.",
    });
  };

  const handleDatabaseAction = (action: string) => {
    console.log(`Performing database action: ${action}`);
    toast({
      title: "Database Operation",
      description: `${action} operation has been initiated.`,
    });
  };

  const handleSaveSecurity = () => {
    console.log("Saving security settings:", {
      minPasswordLength,
      maxLoginAttempts,
      twoFactorAuth,
      forcePasswordReset,
      logUserActivities
    });
    toast({
      title: "Security Settings Saved",
      description: "Security settings have been updated successfully.",
    });
  };

  const handleSecurityAction = (action: string) => {
    console.log(`Performing security action: ${action}`);
    toast({
      title: "Security Operation",
      description: `${action} operation has been completed.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <SidebarInset>
          <Header />
          <div className="container mx-auto py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">System Settings</h1>
              <p className="text-muted-foreground">Manage system-wide configurations and settings</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="database" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="server" className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Server
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure general system settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="systemName">System Name</Label>
                        <Input 
                          id="systemName" 
                          value={systemName}
                          onChange={(e) => setSystemName(e.target.value)}
                          placeholder="Lab Management System" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Administrator Email</Label>
                        <Input 
                          id="adminEmail" 
                          type="email" 
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@lab.com" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict system access</p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">System Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send email notifications for system events</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveGeneral}>Save General Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Settings</CardTitle>
                    <CardDescription>Manage database configurations and maintenance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoBackups">Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">Enable daily automatic database backups</p>
                      </div>
                      <Switch
                        id="autoBackups"
                        checked={autoBackups}
                        onCheckedChange={setAutoBackups}
                      />
                    </div>

                    <div>
                      <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                      <Input 
                        id="backupRetention" 
                        type="number" 
                        value={backupRetention}
                        onChange={(e) => setBackupRetention(e.target.value)}
                        placeholder="30" 
                        className="w-32" 
                      />
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Database Maintenance</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleDatabaseAction("Optimize Database")}>
                          Optimize Database
                        </Button>
                        <Button variant="outline" onClick={() => handleDatabaseAction("Run Cleanup")}>
                          Run Cleanup
                        </Button>
                        <Button variant="outline" onClick={() => handleDatabaseAction("Export Data")}>
                          Export Data
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Backup Management</h4>
                      <div className="flex gap-2">
                        <Button onClick={() => handleDatabaseAction("Create Backup")}>
                          Create Backup
                        </Button>
                        <Button variant="outline" onClick={() => handleDatabaseAction("View Backups")}>
                          View Backups
                        </Button>
                        <Button variant="outline" onClick={() => handleDatabaseAction("Restore")}>
                          Restore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="server">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Configuration</CardTitle>
                    <CardDescription>Configure server and performance settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="maxUsers">Maximum Concurrent Users</Label>
                        <Input 
                          id="maxUsers" 
                          type="number" 
                          value={maxUsers}
                          onChange={(e) => setMaxUsers(e.target.value)}
                          placeholder="100" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input 
                          id="sessionTimeout" 
                          type="number" 
                          value={sessionTimeout}
                          onChange={(e) => setSessionTimeout(e.target.value)}
                          placeholder="60" 
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Performance Monitoring</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-green-600">98%</div>
                          <div className="text-sm text-muted-foreground">Uptime</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-blue-600">45</div>
                          <div className="text-sm text-muted-foreground">Active Users</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-orange-600">2.3GB</div>
                          <div className="text-sm text-muted-foreground">Memory Usage</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage system security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="minPasswordLength">Minimum Password Length</Label>
                        <Input 
                          id="minPasswordLength" 
                          type="number" 
                          value={minPasswordLength}
                          onChange={(e) => setMinPasswordLength(e.target.value)}
                          placeholder="8" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                        <Input 
                          id="maxLoginAttempts" 
                          type="number" 
                          value={maxLoginAttempts}
                          onChange={(e) => setMaxLoginAttempts(e.target.value)}
                          placeholder="5" 
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Security Policies</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Require two-factor authentication</span>
                          <Switch 
                            checked={twoFactorAuth}
                            onCheckedChange={setTwoFactorAuth}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Force password reset every 90 days</span>
                          <Switch 
                            checked={forcePasswordReset}
                            onCheckedChange={setForcePasswordReset}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Log all user activities</span>
                          <Switch 
                            checked={logUserActivities}
                            onCheckedChange={setLogUserActivities}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Security Monitoring</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSecurityAction("View Security Logs")}>
                          View Security Logs
                        </Button>
                        <Button variant="outline" onClick={() => handleSecurityAction("Export Audit Trail")}>
                          Export Audit Trail
                        </Button>
                        <Button variant="outline" onClick={() => handleSecurityAction("Security Report")}>
                          Security Report
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SystemSettings;
