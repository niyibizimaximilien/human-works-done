import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRWF } from "@/lib/contactFilter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload, Clock, CheckCircle, FileText, Plus,
  BookOpen, X, Eye, Briefcase, Loader2,
  Star, CreditCard, Download, Send, AlertTriangle, Search
} from "lucide-react";
import StatusTimeline from "@/components/StatusTimeline";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import ReviewDialog from "@/components/ReviewDialog";
import AgentProfileDialog from "@/components/AgentProfileDialog";
import EmptyState from "@/components/EmptyState";
import AssignmentChat from "@/components/AssignmentChat";
import { StatsSkeleton, CardListSkeleton } from "@/components/DashboardSkeleton";

const SLA_OPTIONS = [
  { value: "standard", label: "Standard (48h)", fee: 0 },
  { value: "priority", label: "Priority (12h)", fee: 500 },
  { value: "express", label: "Express (4h)", fee: 1500 },
];

const PAGE_SIZE = 10;

interface AgentInfo {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  university: string | null;
  department: string | null;
  avgRating: number;
  reviewCount: number;
  onTimeRate: number;
}

const StudentDashboard = () => {
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentRequested, setAgentRequested] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [reviews, setReviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", deadline: "", budget: "",
    sla_tier: "standard", selected_agent: "",
  });

  useEffect(() => {
    if (user) { fetchAssignments(); checkAgentRequest(); fetchAgents(); fetchMyReviews(); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("student-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments", filter: `student_id=eq.${user.id}` },
        () => { fetchAssignments(); toast({ title: "📋 Assignment updated", description: "An assignment status changed." }); }
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => { playNotificationSound(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const playNotificationSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800; gain.gain.value = 0.1;
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch { /* ignore audio errors */ }
  };

  const fetchAssignments = async () => {
    const { data } = await supabase.from("assignments").select("*")
      .eq("student_id", user!.id).order("created_at", { ascending: false });
    setAssignments(data || []);
    setFetching(false);
  };

  const fetchAgents = async () => {
    const { data: agentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "agent");
    if (agentRoles && agentRoles.length > 0) {
      const ids = agentRoles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
      const { data: reviewsData } = await supabase.from("agent_reviews").select("agent_id, rating, on_time");
      const agentList: AgentInfo[] = (profiles || []).map(p => {
        const ar = (reviewsData || []).filter(r => r.agent_id === p.user_id);
        const avgRating = ar.length > 0 ? ar.reduce((s, r) => s + r.rating, 0) / ar.length : 0;
        const onTimeRate = ar.length > 0 ? (ar.filter(r => r.on_time).length / ar.length) * 100 : 0;
        return {
          user_id: p.user_id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          university: p.university,
          department: p.department,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: ar.length,
          onTimeRate: Math.round(onTimeRate),
        };
      });
      setAgents(agentList);
    }
  };

  const fetchMyReviews = async () => {
    const { data } = await supabase.from("agent_reviews").select("assignment_id").eq("student_id", user!.id);
    setReviews((data || []).map(r => r.assignment_id));
  };

  const checkAgentRequest = async () => {
    const { data } = await supabase.from("audit_logs").select("id")
      .eq("user_id", user!.id).eq("action", "agent_request").limit(1);
    setAgentRequested((data?.length || 0) > 0);
  };

  const requestAgentRole = async () => {
    await supabase.from("audit_logs").insert({
      user_id: user!.id, action: "agent_request", entity_type: "user", entity_id: user!.id,
      metadata: { requested_at: new Date().toISOString() },
    });
    setAgentRequested(true);
    toast({ title: "Request submitted!", description: "An admin will review your agent application." });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.selected_agent) {
      toast({ title: "Select an agent", description: "Please choose an agent to send this assignment to.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const slaFee = SLA_OPTIONS.find(s => s.value === form.sla_tier)?.fee || 0;
    try {
      const { data: newAssignment, error } = await supabase.from("assignments").insert({
        student_id: user!.id,
        agent_id: form.selected_agent,
        title: form.title,
        description: form.description,
        subject: form.subject,
        deadline: new Date(form.deadline).toISOString(),
        budget: (parseFloat(form.budget) || 0) + slaFee || null,
        sla_tier: form.sla_tier,
        priority_fee: slaFee,
        status: "in_progress",
      }).select().single();
      if (error) throw error;

      if (briefFile && newAssignment) {
        const path = `${newAssignment.id}/${Date.now()}-${briefFile.name}`;
        const { error: uploadError } = await supabase.storage.from("assignment-files").upload(path, briefFile);
        if (!uploadError) {
          await supabase.from("assignments").update({ file_url: path }).eq("id", newAssignment.id);
        }
      }

      await supabase.from("notifications").insert({
        user_id: form.selected_agent,
        title: "New Assignment Received 📄",
        message: `You received a new assignment: "${form.title}"`,
        link: "/dashboard",
      });
      toast({ title: "Assignment sent!", description: "The agent has been notified." });
      setShowNew(false);
      setForm({ title: "", description: "", subject: "", deadline: "", budget: "", sla_tier: "standard", selected_agent: "" });
      setBriefFile(null);
      fetchAssignments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create assignment.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (assignmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const path = `${assignmentId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("assignment-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("assignments").update({ file_url: path }).eq("id", assignmentId);
      toast({ title: "Document attached!" });
      fetchAssignments();
    }
    setUploadingFile(false);
  };

  const handlePaymentProof = async (assignmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    const path = `payment-proofs/${assignmentId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("assignment-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("assignment-files").getPublicUrl(path);
      await supabase.from("assignments").update({ payment_proof_url: publicUrl, payment_status: "paid" }).eq("id", assignmentId);
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles) {
        for (const ar of adminRoles) {
          await supabase.from("notifications").insert({ user_id: ar.user_id, title: "Payment Proof Uploaded 💰", message: `Student uploaded payment proof.`, link: "/dashboard" });
        }
      }
      toast({ title: "Payment proof uploaded!" });
      fetchAssignments();
    }
    setUploadingProof(false);
  };

  const downloadFile = async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) { toast({ title: "Download failed", variant: "destructive" }); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = path.split("/").pop() || "file"; a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = (a: any) => {
    if (a.admin_released) return { text: "Completed ✓", cls: "bg-primary/10 text-primary" };
    if (a.payment_status === "paid") return { text: "Payment Sent", cls: "bg-info/10 text-info" };
    if (a.payment_status === "pending_payment") return { text: "Pay Now", cls: "bg-warn/10 text-warn" };
    if (a.status === "submitted") return { text: "Under Review", cls: "bg-info/10 text-info" };
    if (a.status === "in_progress") return { text: "In Progress", cls: "bg-warn/10 text-warn" };
    if (a.transferred_from) return { text: "Transferred", cls: "bg-muted text-muted-foreground" };
    return { text: a.status.replace(/_/g, " "), cls: "bg-muted text-muted-foreground" };
  };

  const filteredAssignments = assignments.filter(a =>
    !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedAssignments = filteredAssignments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredAssignments.length / PAGE_SIZE);

  if (fetching) {
    return <div className="max-w-5xl mx-auto space-y-6"><StatsSkeleton /><CardListSkeleton /></div>;
  }

  // ── Detail View ──
  if (selectedId) {
    const assignment = assignments.find(a => a.id === selectedId);
    if (!assignment) { setSelectedId(null); return null; }
    const sl = statusLabel(assignment);
    const agentProfile = agents.find(a => a.user_id === assignment.agent_id);
    const hasReviewed = reviews.includes(assignment.id);
    return (
      <div className="max-w-3xl mx-auto space-y-4 page-enter">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="mb-2 tap-highlight">← Back</Button>
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-heading font-bold">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                {assignment.subject && <Badge variant="secondary" className="mt-2">{assignment.subject}</Badge>}
              </div>
              <Badge className={sl.cls}>{sl.text}</Badge>
            </div>

            {agentProfile && (
              <AgentProfileDialog agentUserId={agentProfile.user_id}>
                <button className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors w-full text-left tap-highlight">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agentProfile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(agentProfile.full_name || "A").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{agentProfile.full_name || "Agent"}</p>
                    <p className="text-[10px] text-muted-foreground">Tap to view profile</p>
                  </div>
                </button>
              </AgentProfileDialog>
            )}

            <StatusTimeline assignment={assignment} />

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <DeadlineCountdown deadline={assignment.deadline} />
              {assignment.budget && <span className="text-primary font-semibold">{formatRWF(assignment.budget)}</span>}
              {assignment.sla_tier !== "standard" && <Badge variant="outline" className="uppercase text-[10px]">{assignment.sla_tier}</Badge>}
            </div>

            {assignment.transferred_from && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
                This assignment was transferred.
                {assignment.transfer_reason && <span>Reason: {assignment.transfer_reason}</span>}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(assignment.id, e)} disabled={uploadingFile}
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar" />
                <Button variant="outline" size="sm" asChild disabled={uploadingFile} className="tap-highlight">
                  <span><Upload className="mr-1.5 h-4 w-4" /> {uploadingFile ? "Uploading..." : "Attach Doc"}</span>
                </Button>
              </label>
              {assignment.file_url && (
                <Button variant="outline" size="sm" onClick={() => downloadFile("assignment-files", assignment.file_url)} className="tap-highlight">
                  <Download className="mr-1.5 h-4 w-4" /> View Brief
                </Button>
              )}
              {assignment.admin_released && assignment.deliverable_url && (
                <Button variant="default" size="sm" className="gold-glow tap-highlight" onClick={() => downloadFile("deliverables", assignment.deliverable_url)}>
                  <Download className="mr-1.5 h-4 w-4" /> Download Results
                </Button>
              )}
            </div>

            {assignment.admin_released && !hasReviewed && assignment.agent_id && (
              <ReviewDialog assignmentId={assignment.id} agentId={assignment.agent_id} studentId={user!.id} onReviewSubmitted={() => { fetchMyReviews(); fetchAgents(); }}>
                <Button variant="outline" size="sm" className="w-full tap-highlight">
                  <Star className="mr-2 h-4 w-4" /> Rate this Agent
                </Button>
              </ReviewDialog>
            )}

            {assignment.payment_status === "pending_payment" && !assignment.admin_released && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h4 className="font-heading font-semibold">Payment Required</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Your work is complete! Upload payment proof to receive results.</p>
                  <p className="text-lg font-bold text-primary">{formatRWF(assignment.budget)}</p>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => handlePaymentProof(assignment.id, e)} disabled={uploadingProof} accept=".pdf,.jpg,.jpeg,.png,.gif" />
                    <Button size="sm" className="gold-glow tap-highlight" asChild disabled={uploadingProof}>
                      <span><Upload className="mr-1.5 h-4 w-4" /> {uploadingProof ? "Uploading..." : "Upload Payment Proof"}</span>
                    </Button>
                  </label>
                </CardContent>
              </Card>
            )}
            {assignment.payment_status === "paid" && !assignment.admin_released && (
              <div className="text-sm text-info flex items-center gap-2 bg-info/5 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" /> Payment proof submitted. Waiting for admin to release.
              </div>
            )}

            {/* In-app chat */}
            <AssignmentChat
              assignmentId={assignment.id}
              otherUserProfile={agentProfile ? { full_name: agentProfile.full_name || undefined, avatar_url: agentProfile.avatar_url || undefined } : null}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Stats ──
  const stats = [
    { label: "Total", value: assignments.length, icon: BookOpen, color: "text-primary" },
    { label: "In Progress", value: assignments.filter(a => a.status === "in_progress").length, icon: Clock, color: "text-warn" },
    { label: "Awaiting Pay", value: assignments.filter(a => a.payment_status === "pending_payment").length, icon: CreditCard, color: "text-info" },
    { label: "Completed", value: assignments.filter(a => a.admin_released).length, icon: CheckCircle, color: "text-primary" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Student Dashboard</h2>
          <p className="text-muted-foreground text-sm">Send assignments, track progress, and get results.</p>
        </div>
        <div className="flex gap-2">
          {role === "student" && !agentRequested && (
            <Button variant="outline" size="sm" onClick={requestAgentRole} className="text-xs tap-highlight">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Become an Agent
            </Button>
          )}
          {agentRequested && (
            <Button variant="outline" size="sm" disabled className="text-xs text-muted-foreground">
              <Clock className="mr-1.5 h-3.5 w-3.5" /> Agent Request Pending
            </Button>
          )}
          <Button onClick={() => setShowNew(true)} className="gold-glow tap-highlight">
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-border animate-fade-in" style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Assignment Form */}
      {showNew && (
        <Card className="border-primary/20 animate-scale-in" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Send New Assignment</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowNew(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" required maxLength={200} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Physics 201" maxLength={100} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the assignment..." maxLength={2000} className="mt-1 min-h-[80px]" />
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Attach Brief (PDF) — Optional</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer flex-1">
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                      onChange={(e) => setBriefFile(e.target.files?.[0] || null)} />
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
                      {briefFile ? (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium truncate">{briefFile.name}</span>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setBriefFile(null); }} className="text-destructive hover:text-destructive/80">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          <Upload className="h-5 w-5 mx-auto mb-1" />
                          Click to attach your assignment document
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-xs">Deadline *</Label>
                <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Budget (RWF)</Label>
                <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="5000" min="0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">SLA Tier</Label>
                <Select value={form.sla_tier} onValueChange={(v) => setForm({ ...form, sla_tier: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SLA_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label} {s.fee > 0 && `(+RWF ${s.fee})`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Send to Agent *</Label>
                <Select value={form.selected_agent} onValueChange={(v) => setForm({ ...form, selected_agent: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose an agent..." /></SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.user_id} value={agent.user_id}>
                        <div className="flex items-center gap-2">
                          <span>{agent.full_name || "Agent"}</span>
                          {agent.reviewCount > 0 && <span className="text-[10px] text-muted-foreground">⭐ {agent.avgRating} ({agent.reviewCount})</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {agents.length > 0 && (
                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block">Recommended Agents</Label>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {agents.sort((a, b) => b.avgRating - a.avgRating).slice(0, 4).map(agent => (
                      <button key={agent.user_id} type="button"
                        onClick={() => setForm({ ...form, selected_agent: agent.user_id })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all shrink-0 tap-highlight ${
                          form.selected_agent === agent.user_id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                        }`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={agent.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(agent.full_name || "A").slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-xs font-medium">{agent.full_name || "Agent"}</p>
                          <div className="flex items-center gap-1">
                            {agent.reviewCount > 0 ? (
                              <>
                                <Star className="h-3 w-3 text-primary fill-primary" />
                                <span className="text-[10px] text-muted-foreground">{agent.avgRating} · {agent.onTimeRate}% on-time</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">New agent</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowNew(false)} className="tap-highlight">Cancel</Button>
                <Button type="submit" disabled={loading} className="gold-glow tap-highlight">
                  <Send className="mr-2 h-4 w-4" /> {loading ? "Sending..." : "Send Assignment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {assignments.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assignments..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} />
        </div>
      )}

      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <EmptyState icon={FileText} title="No assignments yet" description="Send your first assignment to an agent." action={
            <Button onClick={() => setShowNew(true)} className="gold-glow tap-highlight"><Plus className="mr-2 h-4 w-4" /> New Assignment</Button>
          } />
        ) : (
          paginatedAssignments.map((a, i) => {
            const sl = statusLabel(a);
            const agentProfile = agents.find(ag => ag.user_id === a.agent_id);
            return (
              <Card key={a.id} className="border-border card-hover cursor-pointer animate-fade-in"
                style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 60}ms` }}
                onClick={() => setSelectedId(a.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {agentProfile && (
                      <Avatar className="h-8 w-8 shrink-0 hidden sm:flex">
                        <AvatarImage src={agentProfile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{(agentProfile.full_name || "A").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {a.subject && <span>{a.subject}</span>}
                        <DeadlineCountdown deadline={a.deadline} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.budget && <span className="text-sm font-medium text-primary hidden sm:block">{formatRWF(a.budget)}</span>}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sl.cls}`}>{sl.text}</span>
                    <Eye className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="tap-highlight">Prev</Button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="tap-highlight">Next</Button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
