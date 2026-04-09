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
  ScrollText, CreditCard, Download, Send, Unlock, Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "users" | "assignments" | "audit" | "requests" | "payments">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => { fetchAll(); }, []);

  // Real-time
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" }, () => fetchAll())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => playSound())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const playSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 900; gain.gain.value = 0.1;
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

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
    const requests = (logs || []).filter(l => l.action === "agent_request");
    setAgentRequests(requests);
    const map: Record<string, any> = {};
    (profs || []).forEach(p => { map[p.user_id] = p; });
    setProfiles(map);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "student";

  const approveAgentRequest = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "agent" as any });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await supabase.from("notifications").insert({
      user_id: userId, title: "Agent Role Approved! 🎉",
      message: "You've been approved as an agent. You can now receive assignments.",
      link: "/dashboard",
    });
    toast({ title: "Agent approved!" }); fetchAll();
  };

  const notifyStudentToPay = async (assignment: any) => {
    await supabase.from("assignments").update({ payment_status: "pending_payment" } as any).eq("id", assignment.id);
    await supabase.from("notifications").insert({
      user_id: assignment.student_id,
      title: "Your Work is Ready! 💼",
      message: `Your assignment "${assignment.title}" is complete. Please make payment to receive results.`,
      link: "/dashboard",
    });
    await supabase.from("audit_logs").insert({
      user_id: user!.id, action: "notify_payment", entity_type: "assignment", entity_id: assignment.id,
    });
    toast({ title: "Student notified to pay!" }); fetchAll();
  };

  const releaseResults = async (assignment: any) => {
    await supabase.from("assignments").update({
      admin_released: true, status: "completed",
      reviewed_at: new Date().toISOString(),
    } as any).eq("id", assignment.id);
    await supabase.from("notifications").insert({
      user_id: assignment.student_id,
      title: "Results Released! 🎉",
      message: `Your assignment "${assignment.title}" results are now available for download.`,
      link: "/dashboard",
    });
    await supabase.from("audit_logs").insert({
      user_id: user!.id, action: "release_results", entity_type: "assignment", entity_id: assignment.id,
    });
    toast({ title: "Results released to student!" }); fetchAll();
  };

  const transferAssignment = async (assignmentId: string, newAgentId: string, reason: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    await supabase.from("assignments").update({
      transferred_from: assignment.agent_id,
      agent_id: newAgentId,
      transfer_reason: reason,
      status: "in_progress",
      deliverable_url: null,
      submitted_at: null,
    } as any).eq("id", assignmentId);
    await supabase.from("notifications").insert({
      user_id: newAgentId, title: "Assignment Transferred to You 📋",
      message: `You received a transferred assignment: "${assignment.title}"`,
      link: "/dashboard",
    });
    await supabase.from("notifications").insert({
      user_id: assignment.student_id, title: "Assignment Transferred ↔️",
      message: `Your assignment "${assignment.title}" was transferred to another agent.`,
      link: "/dashboard",
    });
    toast({ title: "Assignment transferred!" }); fetchAll();
  };

  const deleteAssignment = async (id: string) => {
    await supabase.from("assignments").delete().eq("id", id);
    toast({ title: "Assignment deleted" }); fetchAll();
  };

  const downloadFile = async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) { toast({ title: "Download failed", variant: "destructive" }); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = path.split("/").pop() || "file"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u =>
    !searchQuery || (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.student_id_number || "").includes(searchQuery)
  );

  const totalRevenue = assignments.filter(a => a.status === "completed").reduce((s, a) => s + (parseFloat(a.budget) || 0), 0);
  const submittedForReview = assignments.filter(a => a.status === "submitted");
  const pendingPayment = assignments.filter(a => (a as any).payment_status === "paid" && !(a as any).admin_released);

  const stats = [
    { label: "Users", value: users.length, icon: Users, color: "text-primary" },
    { label: "Assignments", value: assignments.length, icon: FileText, color: "text-info" },
    { label: "Needs Review", value: submittedForReview.length, icon: Clock, color: "text-warn" },
    { label: "Revenue", value: formatRWF(totalRevenue), icon: TrendingUp, color: "text-primary" },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "users", label: "Users", icon: Users },
    { key: "assignments", label: "Assignments", icon: FileText },
    { key: "requests", label: `Requests (${agentRequests.length})`, icon: UserCheck },
    { key: "payments", label: `Payments (${pendingPayment.length})`, icon: CreditCard },
    { key: "audit", label: "Audit", icon: ScrollText },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Super Admin Panel</h2>
        <p className="text-muted-foreground text-sm">Full control — assignments, payments, users, and audit.</p>
      </div>

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

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm"
            onClick={() => setTab(t.key as any)} className="text-xs">
            <t.icon className="mr-1.5 h-3.5 w-3.5" />{t.label}
          </Button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Submitted for review */}
          {submittedForReview.length > 0 && (
            <Card className="border-warn/30" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><Clock className="h-4 w-4 text-warn" /> Needs Your Review ({submittedForReview.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {submittedForReview.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Student: {profiles[a.student_id]?.full_name || "—"} · Agent: {profiles[a.agent_id]?.full_name || "—"}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {a.deliverable_url && (
                        <Button variant="outline" size="sm" onClick={() => downloadFile("deliverables", a.deliverable_url)}>
                          <Download className="mr-1 h-3.5 w-3.5" /> View Work
                        </Button>
                      )}
                      <Button size="sm" className="gold-glow" onClick={() => notifyStudentToPay(a)}>
                        <Send className="mr-1 h-3.5 w-3.5" /> Notify to Pay
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending payment release */}
          {pendingPayment.length > 0 && (
            <Card className="border-primary/30" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Payment Received — Release Results ({pendingPayment.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingPayment.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Student: {profiles[a.student_id]?.full_name || "—"} · {formatRWF(a.budget)}
                      </p>
                      {(a as any).payment_proof_url && (
                        <a href={(a as any).payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          View Payment Proof ↗
                        </a>
                      )}
                    </div>
                    <Button size="sm" className="gold-glow" onClick={() => releaseResults(a)}>
                      <Unlock className="mr-1 h-3.5 w-3.5" /> Release Results
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent assignments */}
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader><CardTitle className="text-sm font-heading">Recent Assignments</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {assignments.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {profiles[a.student_id]?.full_name || "—"} → {profiles[a.agent_id]?.full_name || "—"} · {a.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatRWF(a.budget)}</span>
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
              <Input placeholder="Search by name or ID..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4">User</th>
                    <th className="text-left py-2 pr-4 hidden md:table-cell">Student ID</th>
                    <th className="text-left py-2 pr-4">Role</th>
                    <th className="text-left py-2 pr-4 hidden md:table-cell">Joined</th>
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
                          <div>
                            <span className="font-medium">{u.full_name || "—"}</span>
                            <p className="text-xs text-muted-foreground">{u.university || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{u.student_id_number || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="capitalize text-[10px]">{getUserRole(u.user_id)}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
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
                    <th className="text-left py-2 pr-4">Student</th>
                    <th className="text-left py-2 pr-4">Agent</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Budget</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">{a.title}</td>
                      <td className="py-3 pr-4 text-xs">{profiles[a.student_id]?.full_name || "—"}</td>
                      <td className="py-3 pr-4 text-xs">{profiles[a.agent_id]?.full_name || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="capitalize text-[10px]">{a.status.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs">{formatRWF(a.budget)}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {a.file_url && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Download brief"
                              onClick={() => downloadFile("assignment-files", a.file_url)}>
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {a.deliverable_url && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="View deliverable"
                              onClick={() => downloadFile("deliverables", a.deliverable_url)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {a.status === "submitted" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="Notify to pay"
                              onClick={() => notifyStudentToPay(a)}>
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {(a as any).payment_status === "paid" && !(a as any).admin_released && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" title="Release results"
                              onClick={() => releaseResults(a)}>
                              <Unlock className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAssignment(a.id)}>
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
              <p className="text-sm text-muted-foreground text-center py-8">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {agentRequests.map((req) => {
                  const prof = profiles[req.entity_id || req.user_id];
                  const hasAgentRole = roles.some(r => r.user_id === (req.entity_id || req.user_id) && r.role === "agent");
                  return (
                    <div key={req.id} className="flex items-center justify-between py-3 px-3 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={prof?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {(prof?.full_name || "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{prof?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{prof?.student_id_number || "—"} · {prof?.university || "—"}</p>
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

      {/* Payments */}
      {tab === "payments" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><CreditCard className="h-5 w-5 text-primary" /> Payment Management</CardTitle></CardHeader>
          <CardContent>
            {assignments.filter(a => (a as any).payment_status !== "none").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {assignments.filter(a => (a as any).payment_status !== "none").map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3 px-3 border border-border/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Student: {profiles[a.student_id]?.full_name || "—"} · {formatRWF(a.budget)}
                      </p>
                      {(a as any).payment_proof_url && (
                        <a href={(a as any).payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          View Proof ↗
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{(a as any).payment_status?.replace(/_/g, " ")}</Badge>
                      {(a as any).payment_status === "paid" && !(a as any).admin_released && (
                        <Button size="sm" className="gold-glow" onClick={() => releaseResults(a)}>
                          <Unlock className="mr-1 h-3.5 w-3.5" /> Release
                        </Button>
                      )}
                      {(a as any).admin_released && (
                        <Badge className="bg-primary/10 text-primary text-[10px]">Released ✓</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit */}
      {tab === "audit" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="flex items-center gap-2 font-heading"><ScrollText className="h-5 w-5 text-primary" /> Audit Log</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {profiles[log.user_id]?.full_name || "System"} · {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{log.entity_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
