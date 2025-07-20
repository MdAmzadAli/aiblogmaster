import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Switch, Route, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bot, 
  FileText, 
  BarChart3,
  Edit,
  Trash2,
  Plus,
  Eye,
  Home,
  Calendar,
  Target,
  Mail
} from "lucide-react";

// Import page components
import AutomationPage from "./automation";
import PostEditor from "./post-editor";
import PostsList from "./posts-list";
import AnalyticsPage from "./analytics";
import SettingsPage from "./admin-settings";

export default function AdminLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarItems = [
    { href: "/admin", icon: Home, label: "Dashboard", exact: true },
    { href: "/admin/automation", icon: Bot, label: "AI Automation" },
    { href: "/admin/posts", icon: FileText, label: "Posts Management" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                  AI Blog Admin
                </h1>
              </Link>
              <span className="ml-4 text-sm text-gray-500">Management Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">AI Active</span>
              </div>
              <Link href="/">
                <Button variant="outline" className="text-blue-600 hover:text-blue-800">
                  View Blog
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/logout"}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = item.exact 
                    ? location === item.href 
                    : location.startsWith(item.href);
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/automation" component={AutomationPage} />
              <Route path="/admin/posts" component={PostsList} />
              <Route path="/admin/posts/edit/:id" component={PostEditor} />
              <Route path="/admin/posts/new" component={PostEditor} />
              <Route path="/admin/analytics" component={AnalyticsPage} />
              <Route path="/admin/settings" component={SettingsPage} />
              <Route>
                <AdminDashboard />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">15,432</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">AI Generated</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg SEO Score</p>
                <p className="text-2xl font-bold text-gray-900">84</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/posts/new">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create New Post
              </Button>
            </Link>
            <Link href="/admin/automation">
              <Button variant="outline" className="w-full justify-start">
                <Bot className="w-4 h-4 mr-2" />
                Generate AI Post
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configure Automation
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Post "How to Make Money" published</span>
                <Badge variant="secondary">AI</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Automation settings updated</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New post generated, awaiting approval</span>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}