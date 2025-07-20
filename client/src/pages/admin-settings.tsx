import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Mail, 
  Clock, 
  Target,
  Save
} from "lucide-react";

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    isEnabled: true,
    frequency: "twice-daily",
    scheduledTime: "10:00",
    targetKeywords: "",
    contentType: "how-to",
    wordCount: 1200,
    categories: "",
    adminEmail: "",
  });

  // Fetch automation settings
  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/automation"],
    queryFn: async () => {
      const response = await fetch("/api/admin/automation");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Load existing settings
  useEffect(() => {
    if (existingSettings) {
      setSettings({
        isEnabled: existingSettings.isEnabled ?? true,
        frequency: existingSettings.frequency || "twice-daily",
        scheduledTime: existingSettings.scheduledTime || "10:00",
        targetKeywords: existingSettings.targetKeywords?.join(", ") || "",
        contentType: existingSettings.contentType || "how-to",
        wordCount: existingSettings.wordCount || 1200,
        categories: existingSettings.categories?.join(", ") || "",
        adminEmail: existingSettings.adminEmail || "",
      });
    }
  }, [existingSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/automation", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/automation"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const settingsData = {
      ...settings,
      targetKeywords: settings.targetKeywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean),
      categories: settings.categories
        .split(",")
        .map(c => c.trim())
        .filter(Boolean),
    };

    saveSettingsMutation.mutate(settingsData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure AI automation and platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Automation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              AI Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Automation</label>
                <p className="text-xs text-gray-500">Automatically generate posts using AI</p>
              </div>
              <Switch
                checked={settings.isEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posting Frequency
              </label>
              <Select 
                value={settings.frequency} 
                onValueChange={(value) => setSettings({ ...settings, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twice-daily">Twice Daily (10 AM & 4 PM)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Scheduled Time
              </label>
              <Input
                type="time"
                value={settings.scheduledTime}
                onChange={(e) => setSettings({ ...settings, scheduledTime: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Primary posting time (for twice-daily, this is the first post)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <Select 
                value={settings.contentType} 
                onValueChange={(value) => setSettings({ ...settings, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="how-to">How-to Guides</SelectItem>
                  <SelectItem value="listicle">Listicles</SelectItem>
                  <SelectItem value="tutorial">Tutorials</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="news">News & Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Word Count
              </label>
              <Input
                type="number"
                min="500"
                max="3000"
                step="100"
                value={settings.wordCount}
                onChange={(e) => setSettings({ ...settings, wordCount: parseInt(e.target.value) || 1200 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content & SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Content & SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords
              </label>
              <Textarea
                value={settings.targetKeywords}
                onChange={(e) => setSettings({ ...settings, targetKeywords: e.target.value })}
                placeholder="SEO, content marketing, AI tools, automation"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas. AI will use these for content generation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <Input
                value={settings.categories}
                onChange={(e) => setSettings({ ...settings, categories: e.target.value })}
                placeholder="Technology, Marketing, AI, Business"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate categories with commas. AI will randomly select from these.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Admin Email
              </label>
              <Input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address to receive approval notifications for AI-generated posts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border">
        <div>
          <h3 className="font-semibold text-gray-900">Save Configuration</h3>
          <p className="text-sm text-gray-600">Apply all changes to automation settings</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {settings.isEnabled ? "Active" : "Inactive"}
              </div>
              <div className="text-sm text-gray-600">Automation Status</div>
              <Badge className={settings.isEnabled ? "bg-green-100 text-green-800 mt-2" : "bg-gray-100 text-gray-800 mt-2"}>
                {settings.isEnabled ? "Running" : "Paused"}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {settings.frequency === "twice-daily" ? "2/day" : 
                 settings.frequency === "daily" ? "1/day" :
                 settings.frequency === "weekly" ? "1/week" : "1/month"}
              </div>
              <div className="text-sm text-gray-600">Post Frequency</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {settings.adminEmail ? "Configured" : "Not Set"}
              </div>
              <div className="text-sm text-gray-600">Email Notifications</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}