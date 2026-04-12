import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatRWF } from "@/lib/contactFilter";
import {
  Briefcase, Clock, CheckCircle, FileText, TrendingUp,
  Star, Loader2, Upload, Download, Send, ArrowLeft, FileDown
} from "lucide-react";
import StatusTimeline from "@/components/StatusTimeline";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import EmptyState from "@/components/EmptyState";
import AssignmentChat from "@/components/AssignmentChat";
import { relativeTime } from "@/lib/relativeTime";
import { PageTransition, StaggerGrid, StaggerItem } from "@/components/MotionWrappers";
import { StatsSkeleton, CardListSkeleton } from "@/components/DashboardSkeleton";
import ConfirmDialog from "@/components/ui/alert-dialog-confirm";

const AgentDashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reputation, setReputation] = useState({ avg: 0, count: 0, onTimeRate: 0 });
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [studentProfiles, setStudentProfiles] = useState<Record<string, { full_name?: string; avatar_url?: string }>>({});

  useEffect(() => {
    if (user) { fetchMyTasks(); fetchReputation(); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("agent-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments", filter: `agent_id=eq.${user.id}` },
        () => { fetchMyTasks(); toast({ title: "📋 Task updated" }); playSound(); }
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => { playSound(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const playSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 600; gain.gain.value = 0.1;
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch { /* ignore */ }
  };

  const fetchMyTasks = async () => {
    const { data } = await supabase.from("assignments").select("*")
      .eq("agent_id", user!.id).order("created_at", { ascending: false });
    setMyTasks(data || []);
    setFetching(false);

    // Fetch student profiles for chat
    if (data && data.length > 0) {
      const studentIds = [...new Set(data.map(t => t.student_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", studentIds);
      const map: Record<string, { full_name?: string; avatar_url?: string }> = {};
      (profiles || []).forEach(p => { map[p.user_id] = { full_name: p.full_name || undefined, avatar_url: p.avatar_url || undefined }; });
      setStudentProfiles(map);
    }
  };

  const fetchReputation = async () => {
    const { data } = await supabase.from("agent_reviews").select("*").eq("agent_id", user!.id);
    if (data && data.length > 0) {
      const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
      const onTime = data.filter(r => r.on_time).length / data.length * 100;
      setReputation({ avg: Math.round(avg * 10) / 10, count: data.length, onTimeRate: Math.round(onTime) });
    }
  };

  const handleDeliverableUpload = async (assignmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${assignmentId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("deliverables").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("assignments").update({ deliverable_url: path }).eq("id", assignmentId);
      toast({ title: "Deliverable uploaded!" });
      fetchMyTasks();
    }
    setUploading(false);
  };

  const submitToAdmin = async (assignmentId: string) => {
    const { error } = await supabase.from("assignments").update({
      status: "submitted", submitted_at: new Date().toISOString(),
    }).eq("id", assignmentId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (adminRoles) {
      for (const ar of adminRoles) {
        await supabase.from("notifications").insert({ user_id: ar.user_id, title: "Assignment Submitted 📋", message: `Agent submitted work for review.`, link: "/dashboard" });
      }
    }
    toast({ title: "Submitted to admin!" });
    fetchMyTasks();
  };

  const downloadFile = async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) { toast({ title: "Download failed", variant: "destructive" }); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = path.split("/").pop() || "file"; a.click();
    URL.revokeObjectURL(url);
  };

  if (fetching) {
    return <div className="max-w-5xl mx-auto space-y-6"><StatsSkeleton /><CardListSkeleton /></div>;
  }

  if (selectedId) {
    const task = myTasks.find(t => t.id === selectedId);
    if (!task) { setSelectedId(null); return null; }
    const studentProfile = studentProfiles[task.student_id];
    return (
      <div className="max-w-3xl mx-auto space-y-4 page-enter">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="tap-highlight">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-heading font-bold">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                {task.subject && <Badge variant="secondary" className="mt-2">{task.subject}</Badge>}
              </div>
              <Badge variant="outline" className="capitalize">{task.status.replace(/_/g, " ")}</Badge>
            </div>

            <StatusTimeline assignment={task} />

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <DeadlineCountdown deadline={task.deadline} />
              {task.budget && <span className="text-primary font-semibold">{formatRWF(task.budget)}</span>}
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
              {task.file_url && (
                <Button variant="outline" size="sm" onClick={() => downloadFile("assignment-files", task.file_url)} className="tap-highlight">
                  <Download className="mr-1.5 h-4 w-4" /> Assignment Brief
                </Button>
              )}

              {task.status === "in_progress" && (
                <>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => handleDeliverableUpload(task.id, e)} disabled={uploading}
                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar" />
                    <Button variant="outline" size="sm" asChild disabled={uploading} className="tap-highlight">
                      <span><Upload className="mr-1.5 h-4 w-4" /> {uploading ? "Uploading..." : "Upload Answer"}</span>
                    </Button>
                  </label>
                  {task.deliverable_url && (
                    <ConfirmDialog
                      trigger={<Button size="sm" className="gold-glow tap-highlight"><Send className="mr-1.5 h-4 w-4" /> Submit to Admin</Button>}
                      title="Submit to Admin?"
                      description="This will send your completed work to the admin for review. Make sure you've uploaded the correct deliverable."
                      onConfirm={() => submitToAdmin(task.id)}
                      confirmText="Yes, Submit"
                    />
                  )}
                </>
              )}

              {task.status === "submitted" && (
                <div className="text-sm text-info flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Submitted. Waiting for admin review.
                </div>
              )}
              {task.status === "completed" && (
                <div className="text-sm text-primary flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Completed & paid.
                </div>
              )}
            </div>

            {/* In-app chat */}
            <AssignmentChat
              assignmentId={task.id}
              otherUserProfile={studentProfile || null}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = myTasks.filter(t => t.status === "completed").length;
  const totalEarnings = myTasks.filter(t => t.status === "completed").reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);
  const activeCount = myTasks.filter(t => ["in_progress", "submitted"].includes(t.status)).length;

  const stats = [
    { label: "Received", value: myTasks.length, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active", value: activeCount, icon: Clock, color: "text-[hsl(var(--warn))]", bg: "bg-[hsl(var(--warn))]/10" },
    { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
    { label: "Earnings", value: formatRWF(totalEarnings), icon: TrendingUp, color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10" },
  ];

    return (
    <PageTransition>
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Agent Dashboard</h2>
          <p className="text-muted-foreground text-sm">Manage received assignments and deliver work.</p>
        </div>
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <Button variant="outline" size="sm" className="text-xs tap-highlight" onClick={() => {
              const completed = myTasks.filter(t => t.status === "completed");
              const csv = ["Title,Subject,Budget,Date", ...completed.map(t => `"${t.title}","${t.subject || ""}","${t.budget || 0}","${t.reviewed_at || t.updated_at}"`)].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "my-earnings.csv"; a.click(); URL.revokeObjectURL(url);
            }}>
              <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
          )}
          {reputation.count > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--warn))]/10 border border-[hsl(var(--warn))]/20">
              <Star className="h-4 w-4 text-[hsl(var(--warn))] fill-[hsl(var(--warn))]" />
              <span className="text-sm font-semibold">{reputation.avg}</span>
              <span className="text-xs text-muted-foreground">({reputation.count} reviews · {reputation.onTimeRate}% on-time)</span>
            </div>
          )}
        </div>
      </div>

      <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <StaggerItem key={i}>
            <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl md:text-2xl font-bold font-heading truncate">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGrid>

      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <EmptyState icon={FileText} title="No tasks yet" description="You'll receive assignments from students here." />
        ) : (
          myTasks.map((t, i) => (
            <Card key={t.id} className="border-border card-hover cursor-pointer animate-fade-in"
              style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 60}ms` }}
              onClick={() => setSelectedId(t.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {t.subject && <span>{t.subject}</span>}
                      <DeadlineCountdown deadline={t.deadline} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {t.budget && <span className="text-sm font-semibold text-primary">{formatRWF(t.budget)}</span>}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === "in_progress" ? "bg-warn/10 text-warn" :
                      t.status === "submitted" ? "bg-info/10 text-info" :
                      "bg-primary/10 text-primary"
                    }`}>{t.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
