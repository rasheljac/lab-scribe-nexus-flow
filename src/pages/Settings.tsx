import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Calendar, ExternalLink, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Get the correct base URL for the iCal feed
  const getBaseUrl = () => {
    // Check if we're in development or production
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:54321';
    }
    // For production, use the Supabase project URL
    return 'https://lurczbwtmavcfpqcckpg.supabase.co';
  };

  // Generate the iCal URL using the user ID as a simple token
  const icalUrl = user ? 
    `${getBaseUrl()}/functions/v1/ical-feed?user_id=${user.id}&token=${user.id}` :
    '';
  
  const webcalUrl = icalUrl.replace('https://', 'webcal://').replace('http://', 'webcal://');

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const testICalFeed = async () => {
    try {
      const response = await fetch(icalUrl);
      if (response.ok) {
        toast({
          title: "Success!",
          description: "iCal feed is working correctly",
        });
      } else {
        toast({
          title: "Error",
          description: `iCal feed returned status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test iCal feed",
        variant: "destructive",
      });
    }
  };

  const openCalendarInstructions = () => {
    window.open('https://support.microsoft.com/en-us/office/import-or-subscribe-to-a-calendar-in-outlook-com-cff1429c-5af6-41ec-a5b4-74f2c278e98c', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
            </div>

            {/* Calendar Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Use these URLs to subscribe to your laboratory calendar in external applications. The calendar will automatically update when you add or modify events.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label className="text-sm font-medium">iCal Feed URL (For manual subscription)</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Copy this URL and paste it into your calendar application's "Add Calendar" or "Subscribe to Calendar" feature.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={icalUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(icalUrl, 'iCal URL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testICalFeed}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Webcal URL (For one-click subscription)</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Click the external link button to automatically open your calendar application and subscribe to the calendar.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={webcalUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webcalUrl, 'Webcal URL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(webcalUrl)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Step-by-step instructions:</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div>
                      <strong>Microsoft Outlook (Desktop):</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1">
                        <li>Open Outlook and go to Calendar view</li>
                        <li>Right-click on "Other Calendars" and select "Add Calendar"</li>
                        <li>Choose "From Internet" and paste the iCal URL</li>
                        <li>Click "OK" to subscribe</li>
                      </ol>
                    </div>
                    <div>
                      <strong>Outlook.com (Web):</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1">
                        <li>Go to Calendar in Outlook.com</li>
                        <li>Click "Add calendar" → "Subscribe from web"</li>
                        <li>Paste the iCal URL and give it a name</li>
                        <li>Click "Import"</li>
                      </ol>
                    </div>
                    <div>
                      <strong>Google Calendar:</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1">
                        <li>Open Google Calendar</li>
                        <li>On the left, click the "+" next to "Other calendars"</li>
                        <li>Select "From URL" and paste the iCal URL</li>
                        <li>Click "Add calendar"</li>
                      </ol>
                    </div>
                    <div>
                      <strong>Apple Calendar:</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1">
                        <li>Open Calendar app</li>
                        <li>Go to File → New Calendar Subscription</li>
                        <li>Paste the iCal URL and click "Subscribe"</li>
                        <li>Configure refresh settings and click "OK"</li>
                      </ol>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 mt-2"
                    onClick={openCalendarInstructions}
                  >
                    View Microsoft's official guide →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" placeholder="Enter your institution" />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications for important updates</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailUpdates">Email Updates</Label>
                    <p className="text-sm text-gray-600">Receive weekly email summaries</p>
                  </div>
                  <Switch
                    id="emailUpdates"
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-gray-600">Switch to dark theme</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
