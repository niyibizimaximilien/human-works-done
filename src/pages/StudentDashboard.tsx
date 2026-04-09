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
  BookOpen, X, Eye, Zap, Briefcase, Loader2,
  Star, CreditCard, Download, ArrowRight, Send, AlertTriangle
} from "lucide-react";

const SLA_OPTIONS = [
  { value: "standard", label: "Standard (48h)", fee: 0 },
  { value: "priority", label: "Priority (12h)", fee: 500 },
  { value: "express", label: "Express (4h)", fee: 1500 },
];

const StudentDashboard = () => {
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentRequested, setAgentRequested] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", deadline: "", budget: "",
    sla_tier: "standard", selected_agent: "",
  });

  useEffect(() => {
    if (user) { fetchAssignments(); checkAgentRequest(); fetchAgents(); }
  }, [user]);

  // Real-time assignment updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("student-assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments", filter: `student_id=eq.${user.id}` },
        () => { fetchAssignments(); playNotificationSound(); }
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
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false });
    setAssignments(data || []);
    setFetching(false);
  };

  const fetchAgents = async () => {
    // Fetch users with agent role
    const { data: agentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "agent");
    if (agentRoles && agentRoles.length > 0) {
      const ids = agentRoles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
      // Fetch reviews for rating
      const { data: reviews } = await supabase.from("agent_reviews").select("agent_id, rating, on_time");
      const agentList = (profiles || []).map(p => {
        const agentReviews = (reviews || []).filter(r => r.agent_id === p.user_id);
        const avgRating = agentReviews.length > 0 ? agentReviews.reduce((s, r) => s + r.rating, 0) / agentReviews.length : 0;
        const onTimeRate = agentReviews.length > 0 ? (agentReviews.filter(r => r.on_time).length / agentReviews.length) * 100 : 0;
        return { ...p, avgRating: Math.round(avgRating * 10) / 10, reviewCount: agentReviews.length, onTimeRate: Math.round(onTimeRate) };
      });
      setAgents(agentList);
    }
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
      const { error } = await supabase.from("assignments").insert({
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
      });
      if (error) throw error;
      // Notify the agent
      await supabase.from("notifications").insert({
        user_id: form.selected_agent,
        title: "New Assignment Received 📄",
        message: `You received a new assignment: "${form.title}"`,
        link: "/dashboard",
      });
      toast({ title: "Assignment sent!", description: "The agent has been notified." });
      setShowNew(false);
      setForm({ title: "", description: "", subject: "", deadline: "", budget: "", sla_tier: "standard", selected_agent: "" });
      fetchAssignments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
      await supabase.from("assignments").update({ file_url: path } as any).eq("id", assignmentId);
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
      await supabase.from("assignments").update({
        payment_proof_url: publicUrl,
        payment_status: "paid",
      } as any).eq("id", assignmentId);
      // Notify admin
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles) {
        for (const ar of adminRoles) {
          await supabase.from("notifications").insert({
            user_id: ar.user_id,
            title: "Payment Proof Uploaded 💰",
            message: `Student uploaded payment proof for an assignment.`,
            link: "/dashboard",
          });
        }
      }
      toast({ title: "Payment proof uploaded!", description: "Admin will review and release your results." });
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

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (selectedId) {
    const assignment = assignments.find(a => a.id === selectedId);
    if (!assignment) { setSelectedId(null); return null; }
    const sl = statusLabel(assignment);
    return (
      <div className="max-w-3xl mx-auto space-y-4 page-enter">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="mb-2">
          ← Back to Assignments
        </Button>
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
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span><Clock className="inline h-3.5 w-3.5 mr-1" />Due: {new Date(assignment.deadline).toLocaleString()}</span>
              {assignment.budget && <span className="text-primary font-semibold">{formatRWF(assignment.budget)}</span>}
              {assignment.sla_tier !== "standard" && <Badge variant="outline" className="uppercase text-[10px]">{assignment.sla_tier}</Badge>}
            </div>
            {assignment.transferred_from && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
                This assignment was transferred to a new agent.
                {assignment.transfer_reason && <span>Reason: {assignment.transfer_reason}</span>}
              </div>
            )}

            {/* File Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {/* Attach additional documents */}
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(assignment.id, e)} disabled={uploadingFile}
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar" />
                <Button variant="outline" size="sm" asChild disabled={uploadingFile}>
                  <span><Upload className="mr-1.5 h-4 w-4" /> {uploadingFile ? "Uploading..." : "Attach Document"}</span>
                </Button>
              </label>
              {assignment.file_url && (
                <Button variant="outline" size="sm" onClick={() => downloadFile("assignment-files", assignment.file_url)}>
                  <Download className="mr-1.5 h-4 w-4" /> View Brief
                </Button>
              )}
              {/* Deliverable only visible if admin released */}
              {assignment.admin_released && assignment.deliverable_url && (
                <Button variant="default" size="sm" className="gold-glow" onClick={() => downloadFile("deliverables", assignment.deliverable_url)}>
                  <Download className="mr-1.5 h-4 w-4" /> Download Results
                </Button>
              )}
            </div>

            {/* Payment section */}
            {assignment.payment_status === "pending_payment" && !assignment.admin_released && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h4 className="font-heading font-semibold">Payment Required</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Your work is complete! Upload payment proof to receive your results.</p>
                  <p className="text-lg font-bold text-primary">{formatRWF(assignment.budget)}</p>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => handlePaymentProof(assignment.id, e)} disabled={uploadingProof}
                      accept=".pdf,.jpg,.jpeg,.png,.gif" />
                    <Button size="sm" className="gold-glow" asChild disabled={uploadingProof}>
                      <span><Upload className="mr-1.5 h-4 w-4" /> {uploadingProof ? "Uploading..." : "Upload Payment Proof"}</span>
                    </Button>
                  </label>
                </CardContent>
              </Card>
            )}
            {assignment.payment_status === "paid" && !assignment.admin_released && (
              <div className="text-sm text-info flex items-center gap-2 bg-info/5 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4" /> Payment proof submitted. Waiting for admin to release your results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "Total", value: assignments.length, icon: BookOpen, color: "text-primary" },
    { label: "In Progress", value: assignments.filter(a => a.status === "in_progress").length, icon: Clock, color: "text-warn" },
    { label: "Awaiting Payment", value: assignments.filter(a => a.payment_status === "pending_payment").length, icon: CreditCard, color: "text-info" },
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
            <Button variant="outline" size="sm" onClick={requestAgentRole} className="text-xs">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Become an Agent
            </Button>
          )}
          {agentRequested && (
            <Button variant="outline" size="sm" disabled className="text-xs text-muted-foreground">
              <Clock className="mr-1.5 h-3.5 w-3.5" /> Agent Request Pending
            </Button>
          )}
          <Button onClick={() => setShowNew(true)} className="gold-glow">
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
        </div>
      </div>

      {/* Stats */}
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
                          {agent.reviewCount > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              ⭐ {agent.avgRating} ({agent.reviewCount})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recommended agents */}
              {agents.length > 0 && (
                <div className="md:col-span-2">
                  <Label className="text-xs mb-2 block">Recommended Agents</Label>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {agents.sort((a, b) => b.avgRating - a.avgRating).slice(0, 4).map(agent => (
                      <button type="button" key={agent.user_id}
                        onClick={() => setForm({ ...form, selected_agent: agent.user_id })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all shrink-0 ${
                          form.selected_agent === agent.user_id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                        }`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={agent.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {(agent.full_name || "A").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
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
                <Button variant="outline" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="gold-glow">
                  <Send className="mr-2 h-4 w-4" /> {loading ? "Sending..." : "Send Assignment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold mb-1">No assignments yet</h3>
              <p className="text-sm text-muted-foreground">Send your first assignment to an agent.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((a, i) => {
            const sl = statusLabel(a);
            return (
              <Card key={a.id} className="border-border card-hover cursor-pointer animate-fade-in"
                style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 60}ms` }}
                onClick={() => setSelectedId(a.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.subject && `${a.subject} · `}Due {new Date(a.deadline).toLocaleDateString()}
                        {a.sla_tier !== "standard" && ` · ${a.sla_tier.toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.budget && <span className="text-sm font-medium text-primary">{formatRWF(a.budget)}</span>}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sl.cls}`}>{sl.text}</span>
                    <Eye className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
