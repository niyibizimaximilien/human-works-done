import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, FileText, Settings, LogOut, Users,
  ShieldCheck, Briefcase, Zap, TrendingUp, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const studentNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Assignments", url: "/dashboard/assignments", icon: FileText },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const agentNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Available Tasks", url: "/dashboard/tasks", icon: Zap },
  { title: "My Tasks", url: "/dashboard/my-tasks", icon: Briefcase },
  { title: "Earnings", url: "/dashboard/earnings", icon: TrendingUp },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminNav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/dashboard/users", icon: Users },
  { title: "Assignments", url: "/dashboard/all-assignments", icon: BookOpen },
  { title: "Roles", url: "/dashboard/roles", icon: ShieldCheck },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

function SidebarNav() {
  const { role, profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navItems = role === "admin" ? adminNav : role === "agent" ? agentNav : studentNav;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-foreground">
            MR<span className="text-sidebar-primary">.</span>A
          </span>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === "admin" ? "Admin" : role === "agent" ? "Agent" : "Student"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/50 truncate mb-2">
            {profile?.full_name || user?.email}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive"
          onClick={() => { signOut(); navigate("/"); }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Log Out"}
        </Button>
      </div>
    </Sidebar>
  );
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-xl flex items-center px-4 sticky top-0 z-40">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
