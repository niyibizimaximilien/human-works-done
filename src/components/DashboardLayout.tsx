import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  SidebarProvider, SidebarTrigger, Sidebar, SidebarContent,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, FileText, Settings, LogOut, Users,
  ShieldCheck, Briefcase, TrendingUp, BookOpen,
  ScrollText, Star, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsBell from "@/components/NotificationsBell";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const studentNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const agentNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Earnings", url: "/dashboard/earnings", icon: TrendingUp },
  { title: "Reputation", url: "/dashboard/reputation", icon: Star },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminNav = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

function SidebarNav() {
  const { role, profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navItems = role === "admin" ? adminNav : role === "agent" ? agentNav : studentNav;
  const displayName = profile?.nickname ? `@${profile.nickname}` : (profile?.full_name || "User");
  const initials = (profile?.nickname || profile?.full_name || user?.email || "U")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-heading font-bold text-sidebar-foreground">
            MR<span className="text-sidebar-primary">.</span>A
          </span>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="capitalize text-xs tracking-wider text-muted-foreground">
            {role || "student"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold gold-glow">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive transition-colors tap-highlight"
          onClick={() => { signOut(); navigate("/"); }}>
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Log Out"}
        </Button>
      </div>
    </Sidebar>
  );
}

function MobileBottomNav() {
  const { role } = useAuth();
  const location = useLocation();
  const navItems = role === "admin" ? adminNav : role === "agent" ? agentNav : studentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
          return (
            <NavLink key={item.title} to={item.url} end
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors tap-highlight ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <SidebarNav />
        </div>
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="hidden md:block"><SidebarTrigger /></div>
            <div className="md:hidden">
              <span className="text-sm font-heading font-bold">MR<span className="text-primary">.</span>A</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationsBell />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6 page-enter">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
