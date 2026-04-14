import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatRWF } from "@/lib/contactFilter";
import {
  Users, FileText, TrendingUp, Trash2, UserCheck,
  Search, Eye, Clock, CheckCircle,
  ScrollText, CreditCard, Download, Send, Unlock,
  ArrowRightLeft, Copy, FileDown, AlertTriangle,
  Ban, Shield, Edit, MessageSquare, Plus, RefreshCw,
  UserX, UserPlus, Gavel, Settings, Activity,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/alert-dialog-confirm";
import TransferDialog from "@/components/TransferDialog";
import AdminCharts from "@/components/AdminCharts";
import { relativeTime } from "@/lib/relativeTime";
import { StatsSkeleton } from "@/components/DashboardSkeleton";
import { StaggerGrid, StaggerItem, PageTransition } from "@/components/MotionWrappers";

const PAGE_SIZE = 15;

/* ─── User Management Dialog ─── */
const UserManageDialog = ({
  profile, role, roles, onSave, onBan, onUnban, onRoleChange, onClose, open, setOpen,
}: {
  profile: any; role: string; roles: any[]; onSave: (data: any) => void;
  onBan: (reason: string) => void; onUnban: () => void;
  onRoleChange: (newRole: string) => void; onClose: () => void;
  open: boolean; setOpen: (v: boolean) => void;
}) => {
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [level, setLevel] = useState(profile?.level || "");
  const [banReason, setBanReason] = useState("");
  const [showBan, setShowBan] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || "");
      setFullName(profile.full_name || "");
      setUniversity(profile.university || "");
      setDepartment(profile.department || "");
      setLevel(profile.level || "");
      setSelectedRole(role);
      setShowBan(false);
      setBanReason("");
    }
  }, [profile, role]);

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Manage User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{(profile.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{profile.nickname ? `@${profile.nickname}` : profile.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{profile.student_id_number || "No Student ID"} · Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            {profile.is_banned && <Badge variant="destructive" className="text-[10px] ml-auto">BANNED</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nickname</Label>
              <Input value={nickname} onChange={e => setNickname(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">University</Label>
              <Input value={university} onChange={e => setUniversity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Department</Label>
              <Input value={department} onChange={e => setDepartment(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Level</Label>
            <Input value={level} onChange={e => setLevel(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="text-xs">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => {
              onSave({ nickname, full_name: fullName, university, department, level });
              if (selectedRole !== role) onRoleChange(selectedRole);
            }}>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Save Changes
            </Button>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs font-medium text-destructive">Danger Zone</p>
            {!profile.is_banned ? (
              <>
                {!showBan ? (
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => setShowBan(true)}>
                    <Ban className="mr-1.5 h-3.5 w-3.5" /> Ban User
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Textarea placeholder="Reason for ban..." value={banReason} onChange={e => setBanReason(e.target.value)} className="min-h-[60px]" />
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" className="flex-1" disabled={!banReason.trim()} onClick={() => { onBan(banReason); setShowBan(false); }}>
                        Confirm Ban
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowBan(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={onUnban}>
                <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Unban User
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Assignment Edit Dialog ─── */
const AssignmentEditDialog = ({
  assignment, profiles, agents, open, setOpen, onSave,
}: {
  assignment: any; profiles: Record<string, any>; agents: any[];
  open: boolean; setOpen: (v: boolean) => void;
  onSave: (data: any) => void;
}) => {
  const [status, setStatus] = useState(assignment?.status || "open");
  const [agentId, setAgentId] = useState(assignment?.agent_id || "none");
  const [budget, setBudget] = useState(assignment?.budget?.toString() || "");
  const [escrow, setEscrow] = useState(assignment?.escrow_status || "none");
  const [paymentStatus, setPaymentStatus] = useState(assignment?.payment_status || "none");

  useEffect(() => {
    if (assignment) {
      setStatus(assignment.status);
      setAgentId(assignment.agent_id || "none");
      setBudget(assignment.budget?.toString() || "");
      setEscrow(assignment.escrow_status || "none");
      setPaymentStatus(assignment.payment_status || "none");
    }
  }, [assignment]);

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" /> Edit Assignment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm font-medium">{assignment.title}</p>
          <p className="text-xs text-muted-foreground">{assignment.description?.slice(0, 200)}</p>

          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["open", "in_progress", "submitted", "completed", "cancelled"].map(s => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Assign Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="No agent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No agent</SelectItem>
                {agents.map(a => (
                  <SelectItem key={a.user_id} value={a.user_id}>
                    {a.nickname ? `@${a.nickname}` : a.full_name || "Agent"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Budget (RWF)</Label>
            <Input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Escrow Status</Label>
              <Select value={escrow} onValueChange={setEscrow}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["none", "held", "released", "refunded", "disputed"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["none", "pending_payment", "paid"].map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" onClick={() => {
            onSave({
              status, agent_id: agentId === "none" ? null : agentId,
              budget: budget ? parseFloat(budget) : null,
              escrow_status: escrow, payment_status: paymentStatus,
            });
            setOpen(false);
          }}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Messages Viewer Dialog ─── */
const MessagesDialog = ({
  assignmentId, assignmentTitle, profiles, open, setOpen,
}: {
  assignmentId: string; assignmentTitle: string;
  profiles: Record<string, any>; open: boolean; setOpen: (v: boolean) => void;
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && assignmentId) {
      setLoading(true);
      supabase.from("messages").select("*").eq("assignment_id", assignmentId)
        .order("created_at", { ascending: true }).then(({ data }) => {
          setMessages(data || []);
          setLoading(false);
        });
    }
  }, [open, assignmentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Chat History — {assignmentTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages.</p>
          ) : (
            messages.map(m => {
              const sender = profiles[m.sender_id];
              return (
                <div key={m.id} className="p-2 rounded-lg bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{sender?.nickname ? `@${sender.nickname}` : sender?.full_name || "Unknown"}</span>
                    <span className="text-[10px] text-muted-foreground">{relativeTime(m.created_at)}</span>
                  </div>
                  <p className="text-sm">{m.content}</p>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main Admin Dashboard ─── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [agentRequests, setAgentRequests] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [tab, setTab] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Dialogs
  const [manageUser, setManageUser] = useState<any>(null);
  const [manageUserOpen, setManageUserOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState<any>(null);
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
  const [viewMessages, setViewMessages] = useState<any>(null);
  const [viewMessagesOpen, setViewMessagesOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" }, () => { fetchAll(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => { fetchAll(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "disputes" }, () => { fetchAll(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchAll = async () => {
    const [{ data: profs }, { data: rls }, { data: asns }, { data: logs }, { data: disps }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("assignments").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("disputes").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(profs || []);
    setRoles(rls || []);
    setAssignments(asns || []);
    setAuditLogs(logs || []);
    setAgentRequests((logs || []).filter(l => l.action === "agent_request"));
    setDisputes(disps || []);
    const map: Record<string, any> = {};
    (profs || []).forEach(p => { map[p.user_id] = p; });
    setProfiles(map);
    // Extract agents
    const agentIds = (rls || []).filter(r => r.role === "agent").map(r => r.user_id);
    setAgents((profs || []).filter(p => agentIds.includes(p.user_id)));
    setFetching(false);
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role || "student";

  const logAction = async (action: string, entityType: string, entityId?: string, metadata?: any) => {
    await supabase.from("audit_logs").insert({
      user_id: user!.id, action, entity_type: entityType,
      entity_id: entityId || null, metadata: metadata || {},
    });
  };

  const approveAgentRequest = async (userId: string) => {
    const existing = roles.find(r => r.user_id === userId && r.role === "agent");
    if (existing) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "agent" });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    await supabase.from("notifications").insert({ user_id: userId, title: "Agent Role Approved! 🎉", message: "You've been approved as an agent.", link: "/dashboard" });
    await logAction("approve_agent", "user", userId);
    toast({ title: "Agent approved!" }); fetchAll();
  };

  const notifyStudentToPay = async (assignment: any) => {
    await supabase.from("assignments").update({ payment_status: "pending_payment" }).eq("id", assignment.id);
    await supabase.from("notifications").insert({ user_id: assignment.student_id, title: "Your Work is Ready! 💼", message: `"${assignment.title}" is complete. Please pay to receive results.`, link: "/dashboard" });
    await logAction("notify_payment", "assignment", assignment.id);
    toast({ title: "Student notified!" }); fetchAll();
  };

  const releaseResults = async (assignment: any) => {
    await supabase.from("assignments").update({ admin_released: true, status: "completed", escrow_status: "released", reviewed_at: new Date().toISOString() }).eq("id", assignment.id);
    await supabase.from("notifications").insert({ user_id: assignment.student_id, title: "Results Released! 🎉", message: `"${assignment.title}" results are now available.`, link: "/dashboard" });
    await logAction("release_results", "assignment", assignment.id);
    toast({ title: "Results released!" }); fetchAll();
  };

  const transferAssignment = async (assignmentId: string, newAgentId: string, reason: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    await supabase.from("assignments").update({
      transferred_from: assignment.agent_id, agent_id: newAgentId, transfer_reason: reason,
      status: "in_progress", deliverable_url: null, submitted_at: null,
    }).eq("id", assignmentId);
    await supabase.from("notifications").insert({ user_id: newAgentId, title: "Assignment Transferred 📋", message: `You received: "${assignment.title}"`, link: "/dashboard" });
    await logAction("transfer_assignment", "assignment", assignmentId, { from: assignment.agent_id, to: newAgentId, reason });
    toast({ title: "Assignment transferred!" }); fetchAll();
  };

  const deleteAssignment = async (id: string) => {
    await supabase.from("assignments").delete().eq("id", id);
    await logAction("delete_assignment", "assignment", id);
    toast({ title: "Assignment deleted" }); fetchAll();
  };

  const banUser = async (userId: string, reason: string) => {
    await supabase.from("profiles").update({ is_banned: true, ban_reason: reason } as any).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Account Suspended ⚠️", message: `Your account has been suspended. Reason: ${reason}`, link: "/dashboard" });
    await logAction("ban_user", "user", userId, { reason });
    toast({ title: "User banned" }); setManageUserOpen(false); fetchAll();
  };

  const unbanUser = async (userId: string) => {
    await supabase.from("profiles").update({ is_banned: false, ban_reason: null } as any).eq("user_id", userId);
    await supabase.from("notifications").insert({ user_id: userId, title: "Account Restored ✅", message: "Your account has been restored.", link: "/dashboard" });
    await logAction("unban_user", "user", userId);
    toast({ title: "User unbanned" }); setManageUserOpen(false); fetchAll();
  };

  const updateUserProfile = async (userId: string, data: any) => {
    await supabase.from("profiles").update(data).eq("user_id", userId);
    await logAction("edit_profile", "user", userId, data);
    toast({ title: "Profile updated" }); fetchAll();
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    const currentRole = getUserRole(userId);
    if (currentRole === newRole) return;
    // Delete old role, insert new
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    await supabase.from("notifications").insert({ user_id: userId, title: "Role Changed", message: `Your role has been changed to ${newRole}.`, link: "/dashboard" });
    await logAction("change_role", "user", userId, { from: currentRole, to: newRole });
    toast({ title: `Role changed to ${newRole}` }); fetchAll();
  };

  const updateAssignment = async (id: string, data: any) => {
    const oldAssignment = assignments.find(a => a.id === id);
    await supabase.from("assignments").update(data).eq("id", id);
    // Notify if agent was assigned
    if (data.agent_id && data.agent_id !== oldAssignment?.agent_id) {
      await supabase.from("notifications").insert({
        user_id: data.agent_id, title: "Assignment Assigned 📋",
        message: `You've been assigned: "${oldAssignment?.title}"`, link: "/dashboard",
      });
    }
    await logAction("edit_assignment", "assignment", id, data);
    toast({ title: "Assignment updated" }); fetchAll();
  };

  const bulkApproveAgents = async () => {
    setBulkLoading(true);
    for (const userId of selectedRequests) await approveAgentRequest(userId);
    setSelectedRequests(new Set()); setBulkLoading(false);
  };

  const bulkReleasePayments = async () => {
    setBulkLoading(true);
    for (const id of selectedPayments) {
      const a = assignments.find(x => x.id === id);
      if (a) await releaseResults(a);
    }
    setSelectedPayments(new Set()); setBulkLoading(false);
  };

  const downloadFile = async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) { toast({ title: "Download failed", variant: "destructive" }); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = path.split("/").pop() || "file"; a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!" }); };

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u =>
    !searchQuery || (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.nickname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.student_id_number || "").includes(searchQuery)
  );

  const filteredAssignments = assignments.filter(a =>
    !searchQuery || (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (profiles[a.student_id]?.nickname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (profiles[a.agent_id]?.nickname || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = assignments.filter(a => a.status === "completed").reduce((s, a) => s + (parseFloat(a.budget) || 0), 0);
  const submittedForReview = assignments.filter(a => a.status === "submitted");
  const pendingPayment = assignments.filter(a => a.payment_status === "paid" && !a.admin_released);
  const bannedUsers = users.filter(u => u.is_banned);
  const openDisputes = disputes.filter(d => d.status === "open" || d.status === "under_review");
  const activeUsers = users.filter(u => {
    if (!u.last_active_at) return false;
    return Date.now() - new Date(u.last_active_at).getTime() < 300_000; // 5 min
  });

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Assignments", value: assignments.length, icon: FileText, color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10" },
    { label: "Needs Review", value: submittedForReview.length, icon: Clock, color: "text-[hsl(var(--warn))]", bg: "bg-[hsl(var(--warn))]/10" },
    { label: "Revenue", value: formatRWF(totalRevenue), icon: TrendingUp, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
    { label: "Active Now", value: activeUsers.length, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Banned", value: bannedUsers.length, icon: Ban, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Open Disputes", value: openDisputes.length, icon: AlertTriangle, color: "text-[hsl(var(--warn))]", bg: "bg-[hsl(var(--warn))]/10" },
    { label: "Agents", value: agents.length, icon: UserCheck, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "users", label: "Users", icon: Users },
    { key: "assignments", label: "Assignments", icon: FileText },
    { key: "disputes", label: `Disputes (${openDisputes.length})`, icon: AlertTriangle },
    { key: "requests", label: `Requests (${agentRequests.length})`, icon: UserCheck },
    { key: "payments", label: `Payments (${pendingPayment.length})`, icon: CreditCard },
    { key: "audit", label: "Audit Log", icon: ScrollText },
  ];

  if (fetching) return <div className="max-w-7xl mx-auto space-y-6"><StatsSkeleton /></div>;

  const paginatedAssignments = filteredAssignments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const assignmentPages = Math.ceil(filteredAssignments.length / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Command Center
          </h2>
          <p className="text-muted-foreground text-sm">Full god-mode control over everything.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => fetchAll()} className="text-xs">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV(assignments.map(a => ({
            title: a.title, student: profiles[a.student_id]?.nickname || profiles[a.student_id]?.full_name || "",
            agent: profiles[a.agent_id]?.nickname || profiles[a.agent_id]?.full_name || "",
            status: a.status, budget: a.budget, payment: a.payment_status, escrow: a.escrow_status, created: a.created_at,
          })), "assignments")} className="text-xs">
            <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StaggerItem key={i}>
            <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold font-heading truncate">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGrid>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm"
            onClick={() => { setTab(t.key); setPage(0); setSearchQuery(""); }} className="text-xs">
            <t.icon className="mr-1 h-3.5 w-3.5" />{t.label}
          </Button>
        ))}
      </div>

      {/* Search (users + assignments tabs) */}
      {(tab === "users" || tab === "assignments") && (
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      )}

      {/* ─── OVERVIEW ─── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <AdminCharts assignments={assignments} profiles={profiles} />

          {submittedForReview.length > 0 && (
            <Card className="border-[hsl(var(--warn))]/30" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><Clock className="h-4 w-4 text-[hsl(var(--warn))]" /> Needs Review ({submittedForReview.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {submittedForReview.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {profiles[a.student_id]?.nickname ? `@${profiles[a.student_id].nickname}` : profiles[a.student_id]?.full_name || "—"} →{" "}
                        {profiles[a.agent_id]?.nickname ? `@${profiles[a.agent_id].nickname}` : profiles[a.agent_id]?.full_name || "—"}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {a.deliverable_url && (
                        <Button variant="outline" size="sm" onClick={() => downloadFile("deliverables", a.deliverable_url)}>
                          <Download className="mr-1 h-3 w-3" /> Work
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setViewMessages({ id: a.id, title: a.title }); setViewMessagesOpen(true); }}>
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <ConfirmDialog
                        trigger={<Button size="sm"><Send className="mr-1 h-3 w-3" /> Pay</Button>}
                        title="Notify student to pay?" description="Student will be notified their work is ready."
                        onConfirm={() => notifyStudentToPay(a)} confirmText="Notify"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {pendingPayment.length > 0 && (
            <Card className="border-primary/30" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Release Results ({pendingPayment.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingPayment.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{profiles[a.student_id]?.nickname ? `@${profiles[a.student_id].nickname}` : "—"} · {formatRWF(a.budget)}</p>
                    </div>
                    <ConfirmDialog
                      trigger={<Button size="sm"><Unlock className="mr-1 h-3 w-3" /> Release</Button>}
                      title="Release results?" description="Make sure payment is verified."
                      onConfirm={() => releaseResults(a)} confirmText="Release"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── USERS (God Mode) ─── */}
      {tab === "users" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading"><Users className="h-5 w-5 text-primary" /> All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-3">User</th>
                    <th className="text-left py-2 pr-3 hidden md:table-cell">ID</th>
                    <th className="text-left py-2 pr-3">Role</th>
                    <th className="text-left py-2 pr-3 hidden md:table-cell">Status</th>
                    <th className="text-left py-2 pr-3 hidden lg:table-cell">Last Active</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${u.is_banned ? "opacity-60" : ""}`}>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={u.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(u.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-medium text-xs">{u.nickname ? `@${u.nickname}` : (u.full_name || "—")}</span>
                            <p className="text-[10px] text-muted-foreground truncate">{u.university || "—"} · {u.department || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground hidden md:table-cell">{u.student_id_number || "—"}</td>
                      <td className="py-3 pr-3">
                        <Badge variant="secondary" className="capitalize text-[10px]">{getUserRole(u.user_id)}</Badge>
                      </td>
                      <td className="py-3 pr-3 hidden md:table-cell">
                        {u.is_banned ? (
                          <Badge variant="destructive" className="text-[10px]">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-[hsl(var(--success))]">Active</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-[10px] text-muted-foreground hidden lg:table-cell">
                        {u.last_active_at ? relativeTime(u.last_active_at) : "Never"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Manage user"
                            onClick={() => { setManageUser(u); setManageUserOpen(true); }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <button onClick={() => copyToClipboard(u.user_id)} className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Copy user ID">
                            <Copy className="h-3 w-3" />
                          </button>
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

      {/* ─── ASSIGNMENTS (Full Control) ─── */}
      {tab === "assignments" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading"><FileText className="h-5 w-5 text-primary" /> All Assignments ({filteredAssignments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-3">Title</th>
                    <th className="text-left py-2 pr-3">Student</th>
                    <th className="text-left py-2 pr-3">Agent</th>
                    <th className="text-left py-2 pr-3">Status</th>
                    <th className="text-left py-2 pr-3 hidden md:table-cell">Escrow</th>
                    <th className="text-left py-2 pr-3">Budget</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.map((a) => (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 pr-3 font-medium text-xs max-w-[150px] truncate">{a.title}</td>
                      <td className="py-3 pr-3 text-xs">{profiles[a.student_id]?.nickname ? `@${profiles[a.student_id].nickname}` : "—"}</td>
                      <td className="py-3 pr-3 text-xs">{profiles[a.agent_id]?.nickname ? `@${profiles[a.agent_id].nickname}` : "—"}</td>
                      <td className="py-3 pr-3"><Badge variant="outline" className="capitalize text-[10px]">{a.status.replace(/_/g, " ")}</Badge></td>
                      <td className="py-3 pr-3 hidden md:table-cell"><Badge variant="outline" className="capitalize text-[10px]">{a.escrow_status}</Badge></td>
                      <td className="py-3 pr-3 text-xs">{formatRWF(a.budget)}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit assignment"
                            onClick={() => { setEditAssignment(a); setEditAssignmentOpen(true); }}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="View chat"
                            onClick={() => { setViewMessages({ id: a.id, title: a.title }); setViewMessagesOpen(true); }}>
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          {a.file_url && <Button variant="ghost" size="icon" className="h-7 w-7" title="Download brief" onClick={() => downloadFile("assignment-files", a.file_url)}><Download className="h-3.5 w-3.5" /></Button>}
                          {a.deliverable_url && <Button variant="ghost" size="icon" className="h-7 w-7" title="View deliverable" onClick={() => downloadFile("deliverables", a.deliverable_url)}><Eye className="h-3.5 w-3.5" /></Button>}
                          <TransferDialog assignmentId={a.id} currentAgentId={a.agent_id} onTransfer={(newId, reason) => transferAssignment(a.id, newId, reason)}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Transfer"><ArrowRightLeft className="h-3.5 w-3.5" /></Button>
                          </TransferDialog>
                          <ConfirmDialog
                            trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                            title="Delete assignment?" description="This permanently removes this assignment."
                            onConfirm={() => deleteAssignment(a.id)} confirmText="Delete" variant="destructive"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {assignmentPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <span className="text-xs text-muted-foreground">{page + 1} / {assignmentPages}</span>
                <Button variant="outline" size="sm" disabled={page >= assignmentPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── DISPUTES ─── */}
      {tab === "disputes" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading"><AlertTriangle className="h-5 w-5 text-destructive" /> Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            {disputes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No disputes.</p>
            ) : (
              <div className="space-y-4">
                {disputes.map(d => {
                  const assignment = assignments.find(a => a.id === d.assignment_id);
                  const opener = profiles[d.opened_by];
                  return (
                    <div key={d.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{assignment?.title || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            By: {opener?.nickname ? `@${opener.nickname}` : opener?.full_name || "Unknown"} · {relativeTime(d.created_at)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Student: {profiles[assignment?.student_id]?.nickname ? `@${profiles[assignment.student_id].nickname}` : "—"} · Agent: {profiles[assignment?.agent_id]?.nickname ? `@${profiles[assignment.agent_id].nickname}` : "—"}
                          </p>
                        </div>
                        <Badge variant={d.status === "open" ? "destructive" : d.status === "under_review" ? "secondary" : "outline"} className="text-[10px] capitalize">
                          {d.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{d.reason}</p>
                      {d.evidence_url && <a href={d.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Evidence ↗</a>}
                      <div className="flex gap-2 flex-wrap">
                        {assignment && (
                          <Button variant="outline" size="sm" onClick={() => { setViewMessages({ id: assignment.id, title: assignment.title }); setViewMessagesOpen(true); }}>
                            <MessageSquare className="mr-1 h-3 w-3" /> Chat History
                          </Button>
                        )}
                        {(d.status === "open" || d.status === "under_review") && (
                          <>
                            <ConfirmDialog
                              trigger={<Button size="sm">Release Full Payment</Button>}
                              title="Release full payment to agent?" description="Resolves in favor of the agent."
                              onConfirm={async () => {
                                await supabase.from("disputes").update({ status: "resolved_full", resolved_at: new Date().toISOString() }).eq("id", d.id);
                                if (assignment) {
                                  await supabase.from("assignments").update({ escrow_status: "released", admin_released: true, status: "completed", reviewed_at: new Date().toISOString() }).eq("id", d.assignment_id);
                                }
                                await logAction("resolve_dispute_full", "dispute", d.id);
                                toast({ title: "Dispute resolved — full payment" }); fetchAll();
                              }} confirmText="Release"
                            />
                            <ConfirmDialog
                              trigger={<Button size="sm" variant="outline">Refund Student</Button>}
                              title="Refund student?" description="Agent will not be paid."
                              onConfirm={async () => {
                                await supabase.from("disputes").update({ status: "rejected", resolved_at: new Date().toISOString() }).eq("id", d.id);
                                await supabase.from("assignments").update({ escrow_status: "refunded", payment_status: "none" }).eq("id", d.assignment_id);
                                if (assignment?.student_id) {
                                  await supabase.from("notifications").insert({ user_id: assignment.student_id, title: "Dispute Resolved ✅", message: "Your dispute has been resolved. Refund will be processed.", link: "/dashboard" });
                                }
                                await logAction("resolve_dispute_refund", "dispute", d.id);
                                toast({ title: "Dispute resolved — refunded" }); fetchAll();
                              }} confirmText="Refund" variant="destructive"
                            />
                            {d.status === "open" && (
                              <Button size="sm" variant="outline" onClick={async () => {
                                await supabase.from("disputes").update({ status: "under_review" }).eq("id", d.id);
                                await logAction("review_dispute", "dispute", d.id);
                                toast({ title: "Marked under review" }); fetchAll();
                              }}>Under Review</Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── REQUESTS ─── */}
      {tab === "requests" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading"><UserCheck className="h-5 w-5 text-primary" /> Agent Requests</CardTitle>
            {selectedRequests.size > 0 && (
              <Button size="sm" disabled={bulkLoading} onClick={bulkApproveAgents}>
                Approve {selectedRequests.size}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {agentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {agentRequests.map((req) => {
                  const prof = profiles[req.entity_id || req.user_id];
                  const hasAgentRole = roles.some(r => r.user_id === (req.entity_id || req.user_id) && r.role === "agent");
                  const reqUserId = req.entity_id || req.user_id;
                  return (
                    <div key={req.id} className="flex items-center justify-between py-3 px-3 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {!hasAgentRole && (
                          <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={selectedRequests.has(reqUserId)}
                            onChange={(e) => { const next = new Set(selectedRequests); e.target.checked ? next.add(reqUserId) : next.delete(reqUserId); setSelectedRequests(next); }} />
                        )}
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={prof?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{(prof?.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{prof?.nickname ? `@${prof.nickname}` : prof?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{prof?.university || "—"} · {prof?.department || "—"}</p>
                        </div>
                      </div>
                      {hasAgentRole ? (
                        <Badge className="bg-primary/10 text-primary text-[10px]">Approved</Badge>
                      ) : (
                        <ConfirmDialog
                          trigger={<Button size="sm"><UserCheck className="mr-1.5 h-3.5 w-3.5" /> Approve</Button>}
                          title="Approve as agent?" description={`${prof?.nickname ? `@${prof.nickname}` : "This user"} will gain agent access.`}
                          onConfirm={() => approveAgentRequest(reqUserId)} confirmText="Approve"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── PAYMENTS ─── */}
      {tab === "payments" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading"><CreditCard className="h-5 w-5 text-primary" /> Payments</CardTitle>
            {selectedPayments.size > 0 && (
              <ConfirmDialog
                trigger={<Button size="sm" disabled={bulkLoading}>Release {selectedPayments.size}</Button>}
                title={`Release ${selectedPayments.size} results?`} description="Verify all payments first."
                onConfirm={bulkReleasePayments} confirmText="Release All"
              />
            )}
          </CardHeader>
          <CardContent>
            {assignments.filter(a => a.payment_status !== "none").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {assignments.filter(a => a.payment_status !== "none").map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3 px-3 border border-border/50 rounded-lg">
                    {a.payment_status === "paid" && !a.admin_released && (
                      <input type="checkbox" className="h-4 w-4 rounded accent-primary mr-3 shrink-0" checked={selectedPayments.has(a.id)}
                        onChange={(e) => { const next = new Set(selectedPayments); e.target.checked ? next.add(a.id) : next.delete(a.id); setSelectedPayments(next); }} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{profiles[a.student_id]?.nickname ? `@${profiles[a.student_id].nickname}` : "—"} · {formatRWF(a.budget)}</p>
                      {a.payment_proof_url && <a href={a.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Proof ↗</a>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{a.payment_status?.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{a.escrow_status}</Badge>
                      {a.payment_status === "paid" && !a.admin_released && (
                        <ConfirmDialog
                          trigger={<Button size="sm"><Unlock className="mr-1 h-3 w-3" /> Release</Button>}
                          title="Release results?" description="Verify payment first." onConfirm={() => releaseResults(a)} confirmText="Release"
                        />
                      )}
                      {a.admin_released && <Badge className="bg-primary/10 text-primary text-[10px]">Released ✓</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── AUDIT LOG ─── */}
      {tab === "audit" && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading"><ScrollText className="h-5 w-5 text-primary" /> Full Activity History</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportCSV(auditLogs.map(l => ({
              action: l.action, entity_type: l.entity_type, entity_id: l.entity_id,
              user: profiles[l.user_id]?.nickname || profiles[l.user_id]?.full_name || "System",
              time: l.created_at, metadata: JSON.stringify(l.metadata),
            })), "audit_logs")} className="text-xs">
              <FileDown className="mr-1 h-3 w-3" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 px-2 border-b border-border/30 last:border-0 hover:bg-secondary/20 rounded transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {log.action.includes("ban") ? <Ban className="h-3.5 w-3.5 text-destructive" /> :
                       log.action.includes("role") ? <Shield className="h-3.5 w-3.5 text-primary" /> :
                       log.action.includes("delete") ? <Trash2 className="h-3.5 w-3.5 text-destructive" /> :
                       log.action.includes("transfer") ? <ArrowRightLeft className="h-3.5 w-3.5 text-primary" /> :
                       log.action.includes("release") ? <Unlock className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> :
                       log.action.includes("dispute") ? <Gavel className="h-3.5 w-3.5 text-[hsl(var(--warn))]" /> :
                       <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {profiles[log.user_id]?.nickname ? `@${profiles[log.user_id].nickname}` : profiles[log.user_id]?.full_name || "System"} · {relativeTime(log.created_at)}
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{log.entity_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── DIALOGS ─── */}
      <UserManageDialog
        profile={manageUser}
        role={manageUser ? getUserRole(manageUser.user_id) : "student"}
        roles={roles}
        open={manageUserOpen}
        setOpen={setManageUserOpen}
        onSave={(data) => { if (manageUser) updateUserProfile(manageUser.user_id, data); }}
        onBan={(reason) => { if (manageUser) banUser(manageUser.user_id, reason); }}
        onUnban={() => { if (manageUser) unbanUser(manageUser.user_id); }}
        onRoleChange={(newRole) => { if (manageUser) changeUserRole(manageUser.user_id, newRole); }}
        onClose={() => setManageUser(null)}
      />

      <AssignmentEditDialog
        assignment={editAssignment}
        profiles={profiles}
        agents={agents}
        open={editAssignmentOpen}
        setOpen={setEditAssignmentOpen}
        onSave={(data) => { if (editAssignment) updateAssignment(editAssignment.id, data); }}
      />

      {viewMessages && (
        <MessagesDialog
          assignmentId={viewMessages.id}
          assignmentTitle={viewMessages.title}
          profiles={profiles}
          open={viewMessagesOpen}
          setOpen={setViewMessagesOpen}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
