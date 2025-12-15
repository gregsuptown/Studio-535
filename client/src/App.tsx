import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import RequestQuote from "./pages/RequestQuote";
import Portfolio from "./pages/Portfolio";
import CaseStudy from "./pages/CaseStudy";
import Process from "./pages/Process";
import Admin from "./pages/Admin";
import ProjectDetail from "./pages/ProjectDetail";
import ClientPortal from "./pages/ClientPortal";
import ClientProjectDetail from "./pages/ClientProjectDetail";
import QuoteBuilder from "./pages/QuoteBuilder";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/about" component={About} />
      <Route path="/request-quote" component={RequestQuote} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/portfolio/:id" component={CaseStudy} />
      <Route path="/process" component={Process} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/project/:id" component={ProjectDetail} />
      <Route path="/admin/quote-builder" component={QuoteBuilder} />
      <Route path="/client-portal" component={ClientPortal} />
      <Route path="/client/project/:id" component={ClientProjectDetail} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
