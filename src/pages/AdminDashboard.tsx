import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRWF } from "@/lib/contactFilter";
import {
  Users, FileText, ShieldCheck, TrendingUp, Trash2, UserCheck,
  Ban, Search, Eye, Clock, CheckCircle, Star,
  ScrollText, MessageSquare, CreditCard
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssignmentDetail from "@/components/AssignmentDetail";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
  const [payAgentClicks, setPayAgentClicks] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "users" | "assignments" | "audit" | "messages" | "requests" | "payments">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Messages state
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [{ data: profs }, { data: rls }, { data: asns }, { data: logs }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("assignments").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setUsers(profs || []);
    setRoles(rls || []);
    setAssignments(asns || []);
    setAuditLogs(logs || []);

    // Agent requests
    const requests = (logs || []).filter(l => l.action === "agent_request");
    setAgentRequests(requests);

    // Pay agent clicks
    const payments = (logs || []).filter(l => l.action === "pay_agent_click");
    setPayAgentClicks(payments);

    // Build profiles map
    const map: Record<string, any> = {};
    (profs || []).forEach(p => { map[p.user_id] = p; });
    setProfiles(map);

    // Fetch all messages (admin can see everything)
    const { data: msgs } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(200);
    setAllMessages(msgs || []);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "—";

  const approveAgentRequest = async (userId: string) => {
    // Add agent role
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "agent" as any });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("audit_logs").insert({
      user_id: user!.id, action: "approve_agent", entity_type: "user", entity_id: userId,
    });
    await supabase.from("notifications").insert({
      user_id: userId, title: "Agent Role Approved! 🎉",
      message: "You've been approved as an agent. You can now access the agent dashboard.",
      link: "/dashboard",
    });
    toast({ title: "Agent approved!" });
    fetchAll();
  };

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

  const stats = [
    { label: "Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Assignments", value: assignments.length, icon: FileText, color: "text-info" },
    { label: "Completed", value: assignments.filter(a => a.status === "completed").length, icon: CheckCircle, color: "text-primary" },
    { label: "Revenue", value: formatRWF(totalRevenue), icon: TrendingUp, color: "text-primary" },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "users", label: "Users", icon: Users },
    { key: "assignments", label: "Assignments", icon: FileText },
    { key: "requests", label: `Requests (${agentRequests.length})`, icon: UserCheck },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "payments", label: "Pay Tracking", icon: CreditCard },
    { key: "audit", label: "Audit", icon: ScrollText },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Super Admin Panel</h2>
        <p className="text-muted-foreground text-sm">Full platform control — users, assignments, messages, and audit trail.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-border animate-fade-in" style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold font-heading truncate">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm"
            onClick={() => setTab(t.key as any)} className="text-xs">
            <t.icon className="mr-1.5 h-3.5 w-3.5" />
            {t.label}
          </Button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader><CardTitle className="text-sm font-heading">Recent Assignments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {assignments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 rounded px-2 -mx-2 transition-colors"
                  onClick={() => setSelectedAssignment(a.id)}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.status.replace(/_/g, " ")} · {formatRWF(a.budget)}</p>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader><CardTitle className="text-sm font-heading">Recent Users</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {(u.full_name || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{u.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.university || "—"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize text-[10px]">{getUserRole(u.user_id)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 font-heading"><Users className="h-5 w-5 text-primary" /> All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">User</th>
                    <th className="text-left py-2 pr-4 hidden md:table-cell">University</th>
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2 pr-4 hidden md:table-cell">Joined</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={u.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                              {(u.full_name || "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{u.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{u.university || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="capitalize text-[10px]">{getUserRole(u.user_id)}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" title="Freeze account"
                          onClick={async () => {
                            await supabase.from("audit_logs").insert({ user_id: user!.id, action: "freeze_account", entity_type: "user", entity_id: u.user_id });
                            toast({ title: "Account flagged for review." });
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
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><FileText className="h-5 w-5 text-primary" /> All Assignments</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">Title</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4 hidden md:table-cell">SLA</th>
                    <th className="text-left py-2 pr-4">Budget</th>
                    <th className="text-left py-2 pr-4 hidden md:table-cell">Deadline</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedAssignment(a.id)}>{a.title}</td>
                      <td className="py-3 pr-4">
                        <Select value={a.status} onValueChange={(v) => updateAssignmentStatus(a.id, v)}>
                          <SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["open", "in_progress", "submitted", "completed", "disputed", "cancelled"].map(s => (
                              <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g, " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell"><Badge variant="outline" className="capitalize text-[10px]">{a.sla_tier || "standard"}</Badge></td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">{formatRWF(a.budget)}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs hidden md:table-cell">{new Date(a.deadline).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedAssignment(a.id)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteAssignment(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Agent Requests */}
      {tab === "requests" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><UserCheck className="h-5 w-5 text-primary" /> Agent Requests</CardTitle></CardHeader>
          <CardContent>
            {agentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending agent requests.</p>
            ) : (
              <div className="space-y-3">
                {agentRequests.map((req) => {
                  const prof = profiles[req.entity_id || req.user_id];
                  const hasAgentRole = roles.some(r => r.user_id === (req.entity_id || req.user_id) && r.role === "agent");
                  return (
                    <div key={req.id} className="flex items-center justify-between py-3 px-3 border border-border/50 rounded-lg hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={prof?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {(prof?.full_name || "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{prof?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{prof?.university || "—"} · {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {hasAgentRole ? (
                        <Badge className="bg-primary/10 text-primary text-[10px]">Approved</Badge>
                      ) : (
                        <Button size="sm" className="gold-glow text-xs" onClick={() => approveAgentRequest(req.entity_id || req.user_id)}>
                          <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages (Admin sees all) */}
      {tab === "messages" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><MessageSquare className="h-5 w-5 text-primary" /> All Messages</CardTitle></CardHeader>
          <CardContent>
            {allMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {allMessages.map((m) => {
                  const sender = profiles[m.sender_id];
                  const asn = assignments.find(a => a.id === m.assignment_id);
                  return (
                    <div key={m.id} className="flex items-start gap-3 py-2.5 px-3 border-b border-border/50 last:border-0 hover:bg-secondary/20 rounded transition-colors">
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarImage src={sender?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {(sender?.full_name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{sender?.full_name || "Unknown"}</span>
                          <span className="text-[10px] text-muted-foreground">→ {asn?.title || "Assignment"}</span>
                        </div>
                        <p className="text-sm mt-0.5 break-words">{m.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pay Agent Tracking */}
      {tab === "payments" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><CreditCard className="h-5 w-5 text-primary" /> Pay Agent Click Tracking</CardTitle></CardHeader>
          <CardContent>
            {payAgentClicks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment clicks tracked yet.</p>
            ) : (
              <div className="space-y-2">
                {payAgentClicks.map((click) => {
                  const prof = profiles[click.user_id];
                  return (
                    <div key={click.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={prof?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {(prof?.full_name || "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{prof?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(click.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Assignment: {(click.entity_id || "—").slice(0, 8)}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {tab === "audit" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><ScrollText className="h-5 w-5 text-primary" /> Audit Log</CardTitle></CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No audit logs yet.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{log.entity_type} · {new Date(log.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{log.entity_type}</Badge>
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
