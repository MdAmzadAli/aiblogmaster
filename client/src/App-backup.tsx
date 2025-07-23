import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/blog" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;