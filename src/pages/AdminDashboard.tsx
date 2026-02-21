import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, ShieldCheck, TrendingUp, Trash2, UserCheck,
  Ban, Search, Eye, Clock, CheckCircle, AlertTriangle, Star,
  ScrollText, DollarSign
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssignmentDetail from "@/components/AssignmentDetail";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "users" | "assignments" | "audit">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [{ data: profs }, { data: rls }, { data: asns }, { data: logs }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("assignments").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setUsers(profs || []);
    setRoles(rls || []);
    setAssignments(asns || []);
    setAuditLogs(logs || []);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "—";

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      await supabase.from("audit_logs").insert({ user_id: user!.id, action: "delete", entity_type: "assignment", entity_id: id });
      toast({ title: "Assignment deleted" }); fetchAll();
    }
  };

  const updateAssignmentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("assignments").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      await supabase.from("audit_logs").insert({ user_id: user!.id, action: `status_change_${status}`, entity_type: "assignment", entity_id: id });
      toast({ title: `Status updated to ${status}` }); fetchAll();
    }
  };

  if (selectedAssignment) {
    return <AssignmentDetail assignmentId={selectedAssignment} onBack={() => { setSelectedAssignment(null); fetchAll(); }} />;
  }

  const filteredUsers = users.filter(u =>
    !searchQuery || (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.university || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = assignments.filter(a => a.status === "completed").reduce((s, a) => s + (parseFloat(a.budget) || 0), 0);
  const disputeCount = assignments.filter(a => a.status === "disputed").length;

  const stats = [
    { label: "Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Assignments", value: assignments.length, icon: FileText, color: "text-info" },
    { label: "Completed", value: assignments.filter(a => a.status === "completed").length, icon: CheckCircle, color: "text-primary" },
    { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Super Admin Panel</h2>
        <p className="text-muted-foreground text-sm">Full platform control — users, assignments, audit trail.</p>
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

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["overview", "users", "assignments", "audit"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)} className="capitalize">
            {t === "overview" && <TrendingUp className="mr-1.5 h-4 w-4" />}
            {t === "users" && <Users className="mr-1.5 h-4 w-4" />}
            {t === "assignments" && <FileText className="mr-1.5 h-4 w-4" />}
            {t === "audit" && <ScrollText className="mr-1.5 h-4 w-4" />}
            {t}
          </Button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader><CardTitle className="text-sm">Recent Assignments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {assignments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 rounded px-2 -mx-2 transition-colors"
                  onClick={() => setSelectedAssignment(a.id)}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.status.replace(/_/g, " ")}</p>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader><CardTitle className="text-sm">Recent Users</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{u.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.university || "—"}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{getUserRole(u.user_id)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-4">Name</th>
                    <th className="text-left py-2 pr-4">University</th>
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2 pr-4">Joined</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{u.full_name || "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.university || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="capitalize">{getUserRole(u.user_id)}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" title="Freeze account"
                          onClick={async () => {
                            await supabase.from("audit_logs").insert({ user_id: user!.id, action: "freeze_account", entity_type: "user", entity_id: u.user_id });
                            toast({ title: "Account flagged", description: "User account has been flagged for review." });
                          }}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments */}
      {tab === "assignments" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> All Assignments</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-4">Title</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">SLA</th>
                    <th className="text-left py-2 pr-4">Budget</th>
                    <th className="text-left py-2 pr-4">Deadline</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 font-medium cursor-pointer hover:text-primary" onClick={() => setSelectedAssignment(a.id)}>{a.title}</td>
                      <td className="py-3 pr-4">
                        <Select value={a.status} onValueChange={(v) => updateAssignmentStatus(a.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["open", "in_progress", "submitted", "completed", "disputed", "cancelled"].map(s => (
                              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-4"><Badge variant="outline" className="capitalize text-xs">{a.sla_tier || "standard"}</Badge></td>
                      <td className="py-3 pr-4 text-muted-foreground">{a.budget ? `₦${Number(a.budget).toLocaleString()}` : "—"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(a.deadline).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(a.id)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteAssignment(a.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {tab === "audit" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary" /> Audit Log</CardTitle></CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No audit logs yet.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{log.entity_type} · {new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
