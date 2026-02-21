import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import AgentDashboard from "./AgentDashboard";

const Dashboard = () => {
  const { user, loading, role, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  if (role === "agent") return <AgentDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
