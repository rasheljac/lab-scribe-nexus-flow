
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { profile, updateProfile } = useUserProfile();
  
  // Navigation settings
  const navigationItems = [
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
    { key: "diet-cohorts", label: "Diet Cohorts" },
    { key: "messages", label: "Messages" },
    { key: "sms", label: "SMS" },
    { key: "video-chat", label: "Video Chat" },
    { key: "team", label: "Team" },
    { key: "settings", label: "Settings" },
    { key: "admin-users", label: "User Management" },
    { key: "admin-settings", label: "System Settings" },
  ];

  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    department: profile?.department || "",
    position: profile?.position || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
  });

  const handleNavigationToggle = async (itemKey: string, isVisible: boolean) => {
    try {
      const currentHidden = preferences?.hidden_pages || [];
      let newHidden;
      
      if (isVisible) {
        // Show the item - remove from hidden list
        newHidden = currentHidden.filter(key => key !== itemKey);
      } else {
        // Hide the item - add to hidden list
        newHidden = [...currentHidden, itemKey];
      }
      
      await updatePreferences({ hidden_pages: newHidden });
      
      toast({
        title: "Navigation updated",
        description: `${navigationItems.find(item => item.key === itemKey)?.label} ${isVisible ? 'shown' : 'hidden'} in navigation`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update navigation settings",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileForm);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const isItemVisible = (itemKey: string) => {
    const hiddenPages = preferences?.hidden_pages || [];
    return !hiddenPages.includes(itemKey);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and lab details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profileForm.position}
                      onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us about yourself and your research..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleProfileUpdate}>
                  Update Profile
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
                  {navigationItems.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {isItemVisible(item.key) ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Label htmlFor={`nav-${item.key}`} className="font-medium">
                          {item.label}
                        </Label>
                        <Badge variant={isItemVisible(item.key) ? "default" : "secondary"}>
                          {isItemVisible(item.key) ? "Visible" : "Hidden"}
                        </Badge>
                      </div>
                      <Switch
                        id={`nav-${item.key}`}
                        checked={isItemVisible(item.key)}
                        onCheckedChange={(checked) => handleNavigationToggle(item.key, checked)}
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
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Experiment Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications for experiment changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default View</Label>
                  <Select defaultValue="grid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Items per Page</Label>
                  <Select defaultValue="20">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes</p>
                  </div>
                  <Switch defaultChecked />
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
