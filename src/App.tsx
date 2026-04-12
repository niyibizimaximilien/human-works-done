import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import SettingsPage from "./pages/SettingsPage";
import EarningsPage from "./pages/EarningsPage";
import ReputationPage from "./pages/ReputationPage";
import FaqPage from "./pages/FaqPage";
import SupportPage from "./pages/SupportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect authenticated users away from /auth
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Protect onboarding: must be logged in, must NOT have completed onboarding
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="mr-assignment-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthGuard><Auth /></AuthGuard>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="reputation" element={<ReputationPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
