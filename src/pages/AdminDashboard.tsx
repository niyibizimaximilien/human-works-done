import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Users, FileText, ShieldCheck, TrendingUp,
  Trash2, UserCheck, AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [view, setView] = useState<"overview" | "users" | "assignments" | "roles">("overview");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [{ data: profs }, { data: rls }, { data: asns }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("assignments").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(profs || []);
    setRoles(rls || []);
    setAssignments(asns || []);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "—";

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Assignment removed." });
      fetchAll();
    }
  };

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Assignments", value: assignments.length, icon: FileText, color: "text-info" },
    { label: "Agents", value: roles.filter(r => r.role === "agent").length, icon: UserCheck, color: "text-warn" },
    { label: "Students", value: roles.filter(r => r.role === "student").length, icon: ShieldCheck, color: "text-primary" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Control Panel</h2>
        <p className="text-muted-foreground text-sm">Full oversight of users, assignments, and roles.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-4">Name</th>
                    <th className="text-left py-2 pr-4">University</th>
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{u.full_name || "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.university || "—"}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                          {getUserRole(u.user_id)}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> All Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No assignments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-4">Title</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Budget</th>
                    <th className="text-left py-2 pr-4">Deadline</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{a.title}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          a.status === "open" ? "bg-info/10 text-info" :
                          a.status === "in_progress" ? "bg-warn/10 text-warn" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {a.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{a.budget ? `₦${a.budget}` : "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(a.deadline).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteAssignment(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
