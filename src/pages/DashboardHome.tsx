import { useAuth } from "@/hooks/useAuth";
import StudentDashboard from "./StudentDashboard";
import AgentDashboard from "./AgentDashboard";
import AdminDashboard from "./AdminDashboard";

const DashboardHome = () => {
  const { role } = useAuth();
  if (role === "admin") return <AdminDashboard />;
  if (role === "agent") return <AgentDashboard />;
  return <StudentDashboard />;
};

export default DashboardHome;
