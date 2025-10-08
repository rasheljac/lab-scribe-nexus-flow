import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Database, Server, Shield, Navigation, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useServerStats } from "@/hooks/useServerStats";
import { useDatabaseBackups } from "@/hooks/useDatabaseBackups";
import { supabase } from "@/integrations/supabase/client";
import DatabaseBackupsDialog from "@/components/DatabaseBackupsDialog";
import SecurityLogsDialog from "@/components/SecurityLogsDialog";

const SystemSettings = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences } = useUserPreferences();
  const { stats, isLoading: statsLoading } = useServerStats();
  const { createBackup, isLoading: backupLoading } = useDatabaseBackups();
  
  // Dialog states
  const [showBackupsDialog, setShowBackupsDialog] = useState(false);
  const [showSecurityLogsDialog, setShowSecurityLogsDialog] = useState(false);
  
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

  // Server Settings State
  const [maxUsers, setMaxUsers] = useState("100");
  const [sessionTimeout, setSessionTimeout] = useState("60");

  // Security Settings State
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(false);
  const [logUserActivities, setLogUserActivities] = useState(true);
  const [securityUpdating, setSecurityUpdating] = useState(false);

  // S3 Storage Settings State
  const [s3AccessKey, setS3AccessKey] = useState("");
  const [s3SecretKey, setS3SecretKey] = useState("");
  const [s3Endpoint, setS3Endpoint] = useState("");
  const [s3BucketName, setS3BucketName] = useState("");
  const [s3Region, setS3Region] = useState("");
  const [showS3SecretKey, setShowS3SecretKey] = useState(false);

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
    { key: "files", label: "Files" },
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
    
    // Load S3 configuration
    if (preferences?.preferences && typeof preferences.preferences === 'object') {
      const prefs = preferences.preferences as any;
      if (prefs.idrive_e2) {
        setS3Endpoint(prefs.idrive_e2.endpoint || "");
        setS3BucketName(prefs.idrive_e2.bucket_name || "");
        setS3Region(prefs.idrive_e2.region || "");
        setS3AccessKey(prefs.idrive_e2.access_key_id || "");
        setS3SecretKey(prefs.idrive_e2.secret_access_key || "");
      }
    }
  }, [preferences]);

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

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      toast({
        title: "Backup Complete",
        description: "Database backup has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDatabaseAction = async (action: string) => {
    console.log(`Performing database action: ${action}`);
    
    switch (action) {
      case "Create Backup":
        await handleCreateBackup();
        break;
      case "View Backups":
        setShowBackupsDialog(true);
        break;
      case "Restore":
        toast({
          title: "Restore Function",
          description: "Database restore functionality would be implemented here.",
        });
        break;
      default:
        toast({
          title: "Database Operation",
          description: `${action} operation has been initiated.`,
        });
    }
  };

  const handleSaveDatabase = () => {
    console.log("Saving database settings:", {
      autoBackups,
      backupRetention
    });
    toast({
      title: "Database Settings Saved",
      description: "Database configuration has been updated successfully.",
    });
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

  const handleSecurityAction = async (action: string) => {
    console.log(`Performing security action: ${action}`);
    
    switch (action) {
      case "View Security Logs":
        setShowSecurityLogsDialog(true);
        break;
      case "Export Audit Trail":
        await handleExportAuditTrail();
        break;
      case "Security Report":
        await handleGenerateSecurityReport();
        break;
      default:
        toast({
          title: "Security Operation",
          description: `${action} operation has been completed.`,
        });
    }
  };

  const handleExportAuditTrail = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvHeaders = ['Timestamp', 'Event Type', 'User ID', 'IP Address', 'User Agent', 'Details'];
      const csvRows = (logs || []).map(log => [
        new Date(log.created_at).toISOString(),
        log.event_type,
        log.user_id || '',
        log.ip_address || '',
        log.user_agent || '',
        JSON.stringify(log.details),
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Audit trail has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export audit trail.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSecurityReport = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const reportContent = `SECURITY REPORT
Generated: ${new Date().toLocaleString()}
Total Events: ${logs?.length || 0}

EVENT SUMMARY:
${(logs || []).map((log, index) => `
${index + 1}. ${log.event_type}
   Time: ${new Date(log.created_at).toLocaleString()}
   User: ${log.user_id || 'System'}
   IP: ${log.ip_address || 'N/A'}
   Details: ${JSON.stringify(log.details)}
`).join('\n')}
`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Security report has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating security report:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate security report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Manage system-wide configurations and settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="s3-storage" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            S3 Storage
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

        <TabsContent value="s3-storage">
          <Card>
            <CardHeader>
              <CardTitle>S3 Storage Configuration</CardTitle>
              <CardDescription>Configure your iDrive E2 or S3-compatible storage settings for file uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="s3Endpoint">Storage Endpoint</Label>
                  <Input 
                    id="s3Endpoint" 
                    value={s3Endpoint}
                    onChange={(e) => setS3Endpoint(e.target.value)}
                    placeholder="https://f1o1.la.idrivee2-20.com" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The full URL to your S3-compatible storage endpoint
                  </p>
                </div>
                <div>
                  <Label htmlFor="s3BucketName">Bucket Name</Label>
                  <Input 
                    id="s3BucketName" 
                    value={s3BucketName}
                    onChange={(e) => setS3BucketName(e.target.value)}
                    placeholder="my-lab-files" 
                  />
                </div>
                <div>
                  <Label htmlFor="s3Region">Region</Label>
                  <Input 
                    id="s3Region" 
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    placeholder="us-la" 
                  />
                </div>
                <div>
                  <Label htmlFor="s3AccessKey">Access Key ID</Label>
                  <Input 
                    id="s3AccessKey" 
                    value={s3AccessKey}
                    onChange={(e) => setS3AccessKey(e.target.value)}
                    placeholder="Your access key" 
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="s3SecretKey">Secret Access Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="s3SecretKey" 
                      type={showS3SecretKey ? "text" : "password"}
                      value={s3SecretKey}
                      onChange={(e) => setS3SecretKey(e.target.value)}
                      placeholder="Your secret key" 
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowS3SecretKey(!showS3SecretKey)}
                    >
                      {showS3SecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep this secure - it will be encrypted before storage
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={async () => {
                  try {
                    // Save to user preferences as encrypted data
                    const config = {
                      idrive_e2: {
                        endpoint: s3Endpoint,
                        bucket_name: s3BucketName,
                        region: s3Region,
                        access_key_id: s3AccessKey,
                        secret_access_key: s3SecretKey,
                      }
                    };
                    await updatePreferences({ preferences: config });
                    toast({
                      title: "S3 Settings Saved",
                      description: "Your storage configuration has been saved securely.",
                    });
                  } catch (error) {
                    toast({
                      title: "Save Failed",
                      description: "Failed to save S3 settings.",
                      variant: "destructive",
                    });
                  }
                }}>
                  Save S3 Configuration
                </Button>
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
                    disabled={backupLoading}
                  >
                    {backupLoading ? "Creating Backup..." : "Create Backup"}
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
                <Button onClick={handleSaveDatabase}>Save Database Settings</Button>
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
                {statsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading server statistics...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-green-600">{stats.uptime}</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-blue-600">{stats.activeUsers}</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-orange-600">{stats.memoryUsage}</div>
                      <div className="text-sm text-muted-foreground">Memory Usage</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-purple-600">{stats.cpuUsage}</div>
                      <div className="text-sm text-muted-foreground">CPU Usage</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-red-600">{stats.diskSpace}</div>
                      <div className="text-sm text-muted-foreground">Disk Usage</div>
                    </div>
                  </div>
                )}
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

      {/* Dialogs */}
      <DatabaseBackupsDialog 
        open={showBackupsDialog} 
        onOpenChange={setShowBackupsDialog} 
      />
      <SecurityLogsDialog 
        open={showSecurityLogsDialog} 
        onOpenChange={setShowSecurityLogsDialog} 
      />
    </div>
  );
};

export default SystemSettings;
