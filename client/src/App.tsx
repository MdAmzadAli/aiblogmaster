import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminLayout from "@/pages/admin";
import Post from "@/pages/post";
import PostEditor from "@/pages/post-editor";
import { SEOTestDashboard } from "@/components/seo-test-dashboard";
import { LiveSEOMonitor } from "@/components/live-seo-monitor";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/admin" nest component={AdminLayout} />
      <Route path="/post-editor" component={PostEditor} />
      <Route path="/post-editor/:id" component={PostEditor} />
      <Route path="/post/:slug" component={Post} />
      <Route path="/seo-test" component={SEOTestDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <LiveSEOMonitor />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
