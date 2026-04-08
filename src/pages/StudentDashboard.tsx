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
import {
  Upload, Clock, CheckCircle, FileText, Plus,
  BookOpen, AlertCircle, X, Eye, Zap, Briefcase, Loader2
} from "lucide-react";
import AssignmentDetail from "@/components/AssignmentDetail";

const SLA_OPTIONS = [
  { value: "standard", label: "Standard (48h)", fee: 0 },
  { value: "priority", label: "Priority (12h)", fee: 500 },
  { value: "express", label: "Express (4h)", fee: 1500 },
];

const StudentDashboard = () => {
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentRequested, setAgentRequested] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", deadline: "", budget: "", sla_tier: "standard" });

  useEffect(() => {
    if (user) { fetchAssignments(); checkAgentRequest(); }
  }, [user]);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false });
    setAssignments(data || []);
    setFetching(false);
  };

  const checkAgentRequest = async () => {
    const { data } = await supabase.from("audit_logs")
      .select("id")
      .eq("user_id", user!.id)
      .eq("action", "agent_request")
      .limit(1);
    setAgentRequested((data?.length || 0) > 0);
  };

  const requestAgentRole = async () => {
    await supabase.from("audit_logs").insert({
      user_id: user!.id,
      action: "agent_request",
      entity_type: "user",
      entity_id: user!.id,
      metadata: { requested_at: new Date().toISOString() },
    });
    setAgentRequested(true);
    toast({ title: "Request submitted!", description: "An admin will review your agent application." });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const slaFee = SLA_OPTIONS.find(s => s.value === form.sla_tier)?.fee || 0;
    try {
      const { error } = await supabase.from("assignments").insert({
        student_id: user!.id,
        title: form.title,
        description: form.description,
        subject: form.subject,
        deadline: new Date(form.deadline).toISOString(),
        budget: (parseFloat(form.budget) || 0) + slaFee || null,
        sla_tier: form.sla_tier,
        priority_fee: slaFee,
      });
      if (error) throw error;
      toast({ title: "Assignment posted!", description: "Agents will see it now." });
      setShowNew(false);
      setForm({ title: "", description: "", subject: "", deadline: "", budget: "", sla_tier: "standard" });
      fetchAssignments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (selectedId) {
    return <AssignmentDetail assignmentId={selectedId} onBack={() => { setSelectedId(null); fetchAssignments(); }} />;
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4 text-info" />;
      case "in_progress": return <AlertCircle className="h-4 w-4 text-warn" />;
      case "submitted": return <Zap className="h-4 w-4 text-primary" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const stats = [
    { label: "Total", value: assignments.length, icon: BookOpen, color: "text-primary" },
    { label: "Open", value: assignments.filter(a => a.status === "open").length, icon: Clock, color: "text-info" },
    { label: "In Progress", value: assignments.filter(a => ["in_progress", "submitted"].includes(a.status)).length, icon: AlertCircle, color: "text-warn" },
    { label: "Completed", value: assignments.filter(a => a.status === "completed").length, icon: CheckCircle, color: "text-primary" },
  ];

  if (fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Student Dashboard</h2>
          <p className="text-muted-foreground text-sm">Manage assignments and track progress.</p>
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

      {/* New Assignment */}
      {showNew && (
        <Card className="border-primary/20 animate-scale-in" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Post New Assignment</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowNew(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" required maxLength={200} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Physics 201" maxLength={100} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the assignment in detail..." maxLength={2000} className="mt-1 min-h-[80px]" />
              </div>
              <div>
                <Label className="text-xs">Deadline</Label>
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
              <div className="md:col-span-2 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="gold-glow">
                  <Upload className="mr-2 h-4 w-4" /> {loading ? "Posting..." : "Post Assignment"}
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
              <p className="text-sm text-muted-foreground">Post your first assignment to get started.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((a, i) => (
            <Card key={a.id} className="border-border card-hover cursor-pointer animate-fade-in" style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 60}ms` }}
              onClick={() => setSelectedId(a.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcon(a.status)}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.subject && `${a.subject} · `}Due {new Date(a.deadline).toLocaleDateString()}
                      {a.sla_tier !== "standard" && ` · ${a.sla_tier.toUpperCase()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {a.budget && (
                    <span className="text-sm font-medium text-primary">
                      {formatRWF(a.budget)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    a.status === "open" ? "bg-info/10 text-info" :
                    a.status === "in_progress" ? "bg-warn/10 text-warn" :
                    a.status === "submitted" ? "bg-primary/10 text-primary" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {a.status.replace(/_/g, " ")}
                  </span>
                  <Eye className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
