import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Reports from "@/pages/Reports";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EditProfile from "@/pages/EditProfile";
import HelpChatbot from "@/pages/HelpChatbot";
import WaterQualityDetails from "@/pages/WaterQualityDetails";
import SoilMoistureDetails from "@/pages/SoilMoistureDetails";
import WaterPredictionDetails from "@/pages/WaterPredictionDetails";
import IrrigationTipsDetails from "@/pages/IrrigationTipsDetails";
import ReportDetails from "@/pages/ReportDetails";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { LocationProvider } from "./context/LocationContext";
import { useAuth } from "./hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Protected route component
  const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
    if (isLoading) {
      return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      // Use setTimeout to avoid state update during render
      setTimeout(() => navigate('/login'), 0);
      return <div className="flex h-screen w-full items-center justify-center">Redirecting...</div>;
    }
    
    return <Component />;
  };

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes */}
      <Route path="/">
        {() => <ProtectedRoute component={Home} />}
      </Route>
      <Route path="/reports">
        {() => <ProtectedRoute component={Reports} />}
      </Route>
      <Route path="/alerts">
        {() => <ProtectedRoute component={Alerts} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>

      <Route path="/edit-profile">
        {() => <ProtectedRoute component={EditProfile} />}
      </Route>
      
      <Route path="/help-chatbot">
        {() => <ProtectedRoute component={HelpChatbot} />}
      </Route>
      
      <Route path="/water-quality/:id">
        {() => <ProtectedRoute component={WaterQualityDetails} />}
      </Route>
      
      <Route path="/soil-moisture/:id">
        {() => <ProtectedRoute component={SoilMoistureDetails} />}
      </Route>
      
      <Route path="/water-prediction/:id">
        {() => <ProtectedRoute component={WaterPredictionDetails} />}
      </Route>
      
      <Route path="/irrigation-tips/:id">
        {() => <ProtectedRoute component={IrrigationTipsDetails} />}
      </Route>
      
      <Route path="/report-details/:type">
        {() => <ProtectedRoute component={ReportDetails} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <LocationProvider>
            <Router />
            <Toaster />
          </LocationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
