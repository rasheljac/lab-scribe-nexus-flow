
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, Database, Navigation, Users } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "sonner";

const Settings = () => {
  const { data: profile, updateProfile } = useUserProfile();
  const { data: preferences, updatePreferences } = useUserPreferences();
  const [profileData, setProfileData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
  });

  const handleProfileUpdate = async () => {
    try {
      await updateProfile.mutateAsync(profileData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleNavigationToggle = async (page: string, enabled: boolean) => {
    try {
      const hiddenPages = preferences?.hidden_pages || [];
      const newHiddenPages = enabled 
        ? hiddenPages.filter(p => p !== page)
        : [...hiddenPages, page];
      
      await updatePreferences.mutateAsync({
        hidden_pages: newHiddenPages
      });
      toast.success("Navigation settings updated");
    } catch (error) {
      toast.error("Failed to update navigation settings");
    }
  };

  const navigationPages = [
    { id: 'experiments', label: 'Experiments', icon: '🧪' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'protocols', label: 'Protocols', icon: '📝' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'diet-cohorts', label: 'Diet Cohorts', icon: '🐭' },
    { id: 'mice-orders', label: 'Mice Orders', icon: '🛒' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'sms', label: 'SMS', icon: '💬' },
    { id: 'labels', label: 'Label Printer', icon: '🏷️' },
    { id: 'system-settings', label: 'System Settings', icon: '⚙️' },
  ];

  const hiddenPages = preferences?.hidden_pages || [];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline">Upload Photo</Button>
                    <p className="text-sm text-gray-600 mt-1">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>

                <Button onClick={handleProfileUpdate} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Settings</CardTitle>
                <CardDescription>
                  Customize which pages appear in your sidebar navigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {navigationPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{page.icon}</span>
                        <div>
                          <Label htmlFor={page.id}>{page.label}</Label>
                        </div>
                      </div>
                      <Switch
                        id={page.id}
                        checked={!hiddenPages.includes(page.id)}
                        onCheckedChange={(checked) => handleNavigationToggle(page.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-gray-600">Get reminded about upcoming tasks</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Calendar Reminders</Label>
                      <p className="text-sm text-gray-600">Receive calendar event reminders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Change Password</Label>
                    <p className="text-sm text-gray-600 mb-2">Update your account password</p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 mb-2">Add an extra layer of security</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Not Enabled</Badge>
                      <Button variant="outline" size="sm">Enable 2FA</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Active Sessions</Label>
                    <p className="text-sm text-gray-600 mb-2">Manage your active login sessions</p>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
