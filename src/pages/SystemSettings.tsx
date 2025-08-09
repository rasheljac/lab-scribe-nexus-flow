
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Database, Server, Shield, Navigation, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const SystemSettings = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = useUserPreferences();
  
  // General Settings State
  const [systemName, setSystemName] = useState("Lab Management System");
  const [adminEmail, setAdminEmail] = useState("admin@lab.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Navigation Settings State
  const [hiddenPages, setHiddenPages] = useState<string[]>([]);

  // Database Settings State
  const [autoBackups, setAutoBackups] = useState(true);
  const [backupRetention, setBackupRetention] = useState("30");
  const [backupInProgress, setBackupInProgress] = useState(false);

  // Server Settings State
  const [maxUsers, setMaxUsers] = useState("100");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [serverStats, setServerStats] = useState({
    uptime: "99.2%",
    activeUsers: 47,
    memoryUsage: "2.8GB",
    cpuUsage: "12%",
    diskSpace: "78%"
  });

  // Security Settings State
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);
  const [logUserActivities, setLogUserActivities] = useState(true);
  const [securityUpdating, setSecurityUpdating] = useState(false);

  // Navigation options
  const navigationOptions = [
    { key: "dashboard", label: "Dashboard" },
    { key: "experiments", label: "Experiments" },
    { key: "experiment-ideas", label: "Experiment Ideas" },
    { key: "projects", label: "Projects" },
    { key: "protocols", label: "Protocols" },
    { key: "calendar", label: "Calendar" },
    { key: "tasks", label: "Tasks" },
    { key: "analytics", label: "Analytics" },
    { key: "reports", label: "Reports" },
    { key: "inventory", label: "Inventory" },
    { key: "labels", label: "Label Printer" },
    { key: "orders", label: "Order Portal" },
    { key: "mice-orders", label: "Mice Orders" },
    { key: "messages", label: "Messages" },
    { key: "sms", label: "SMS" },
    { key: "video-chat", label: "Video Chat" },
    { key: "team", label: "Team" },
    { key: "settings", label: "Settings" },
    { key: "admin-users", label: "User Management" },
    { key: "admin-settings", label: "System Settings" },
  ];

  // Load preferences on component mount
  useEffect(() => {
    if (preferences?.hidden_pages) {
      setHiddenPages(preferences.hidden_pages);
    }
  }, [preferences]);

  // Update server stats periodically
  useEffect(() => {
    const updateServerStats = () => {
      setServerStats({
        uptime: `${(99 + Math.random() * 1).toFixed(1)}%`,
        activeUsers: Math.floor(40 + Math.random() * 20),
        memoryUsage: `${(2.5 + Math.random() * 1).toFixed(1)}GB`,
        cpuUsage: `${Math.floor(8 + Math.random() * 15)}%`,
        diskSpace: `${Math.floor(70 + Math.random() * 20)}%`
      });
    };

    updateServerStats();
    const interval = setInterval(updateServerStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSaveGeneral = () => {
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

  const handleSaveNavigation = async () => {
    try {
      await updatePreferences({ hidden_pages: hiddenPages });
      toast({
        title: "Navigation Settings Saved",
        description: "Navigation visibility settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save navigation settings:", error);
      toast({
        title: "Error",
        description: "Failed to save navigation settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePageVisibility = (pageKey: string) => {
    setHiddenPages(prev => 
      prev.includes(pageKey) 
        ? prev.filter(key => key !== pageKey)
        : [...prev, pageKey]
    );
  };

  const handleDatabaseAction = async (action: string) => {
    console.log(`Performing database action: ${action}`);
    
    if (action === "Create Backup") {
      setBackupInProgress(true);
      // Simulate backup process
      setTimeout(() => {
        setBackupInProgress(false);
        toast({
          title: "Backup Complete",
          description: "Database backup has been created successfully.",
        });
      }, 3000);
    } else {
      toast({
        title: "Database Operation",
        description: `${action} operation has been initiated.`,
      });
    }
  };

  const handleSaveServer = () => {
    console.log("Saving server settings:", {
      maxUsers,
      sessionTimeout
    });
    toast({
      title: "Server Settings Saved",
      description: "Server configuration has been updated successfully.",
    });
  };

  const handleSaveSecurity = async () => {
    setSecurityUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSecurityUpdating(false);
    }
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="navigation" className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Navigation
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

              <TabsContent value="navigation">
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation Settings</CardTitle>
                    <CardDescription>Control which navigation items are visible to users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {navigationOptions.map((option) => {
                        const isHidden = hiddenPages.includes(option.key);
                        return (
                          <div key={option.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={option.key}
                              checked={!isHidden}
                              onCheckedChange={() => handleTogglePageVisibility(option.key)}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {isHidden ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-green-600" />
                              )}
                              <Label htmlFor={option.key} className="cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveNavigation}>Save Navigation Settings</Button>
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
                      <div className="flex gap-2 flex-wrap">
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
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={() => handleDatabaseAction("Create Backup")}
                          disabled={backupInProgress}
                        >
                          {backupInProgress ? "Creating Backup..." : "Create Backup"}
                        </Button>
                        <Button variant="outline" onClick={() => handleDatabaseAction("View Backups")}>
                          View Backups
                        </Button>
                        <Button variant="outline" onClick={() => handleDatabaseAction("Restore")}>
                          Restore
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => handleDatabaseAction("Save Database Settings")}>
                        Save Database Settings
                      </Button>
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
                      <h4 className="font-medium">Real-Time Performance Monitoring</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-green-600">{serverStats.uptime}</div>
                          <div className="text-sm text-muted-foreground">Uptime</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-blue-600">{serverStats.activeUsers}</div>
                          <div className="text-sm text-muted-foreground">Active Users</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-orange-600">{serverStats.memoryUsage}</div>
                          <div className="text-sm text-muted-foreground">Memory Usage</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-purple-600">{serverStats.cpuUsage}</div>
                          <div className="text-sm text-muted-foreground">CPU Usage</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-red-600">{serverStats.diskSpace}</div>
                          <div className="text-sm text-muted-foreground">Disk Usage</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveServer}>Save Server Settings</Button>
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
                      <div className="flex gap-2 flex-wrap">
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
                      <Button 
                        onClick={handleSaveSecurity}
                        disabled={securityUpdating}
                      >
                        {securityUpdating ? "Saving..." : "Save Security Settings"}
                      </Button>
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
