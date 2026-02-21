import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase, Clock, CheckCircle, DollarSign,
  FileText, Zap, TrendingUp, Eye, Star
} from "lucide-react";
import AssignmentDetail from "@/components/AssignmentDetail";

const AgentDashboard = () => {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [tab, setTab] = useState<"available" | "my">("available");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reputation, setReputation] = useState({ avg: 0, count: 0, onTimeRate: 0 });

  useEffect(() => {
    if (user) { fetchAvailable(); fetchMyTasks(); fetchReputation(); }
  }, [user]);

  const fetchAvailable = async () => {
    const { data } = await supabase.from("assignments").select("*").eq("status", "open").order("created_at", { ascending: false });
    setAvailableTasks(data || []);
  };

  const fetchMyTasks = async () => {
    const { data } = await supabase.from("assignments").select("*").eq("agent_id", user!.id).order("created_at", { ascending: false });
    setMyTasks(data || []);
  };

  const fetchReputation = async () => {
    const { data } = await supabase.from("agent_reviews").select("*").eq("agent_id", user!.id);
    if (data && data.length > 0) {
      const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
      const onTime = data.filter(r => r.on_time).length / data.length * 100;
      setReputation({ avg: Math.round(avg * 10) / 10, count: data.length, onTimeRate: Math.round(onTime) });
    }
  };

  const acceptTask = async (id: string) => {
    try {
      const { error } = await supabase.from("assignments")
        .update({ agent_id: user!.id, status: "in_progress" })
        .eq("id", id).eq("status", "open");
      if (error) throw error;
      toast({ title: "Task accepted!" });
      fetchAvailable(); fetchMyTasks();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (selectedId) {
    return <AssignmentDetail assignmentId={selectedId} onBack={() => { setSelectedId(null); fetchMyTasks(); fetchAvailable(); }} />;
  }

  const completedCount = myTasks.filter(t => t.status === "completed").length;
  const totalEarnings = myTasks.filter(t => t.status === "completed").reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);
  const activeCount = myTasks.filter(t => ["in_progress", "submitted"].includes(t.status)).length;

  const stats = [
    { label: "Available", value: availableTasks.length, icon: Zap, color: "text-info" },
    { label: "Active", value: activeCount, icon: Clock, color: "text-warn" },
    { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-primary" },
    { label: "Earnings", value: `₦${totalEarnings.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
  ];

  const tasks = tab === "available" ? availableTasks : myTasks;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Agent Dashboard</h2>
          <p className="text-muted-foreground text-sm">Find tasks, deliver, and grow your earnings.</p>
        </div>
        {reputation.count > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm font-semibold">{reputation.avg}</span>
            <span className="text-xs text-muted-foreground">({reputation.count} reviews · {reputation.onTimeRate}% on-time)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      <div className="flex gap-2 mb-6">
        <Button variant={tab === "available" ? "default" : "outline"} size="sm" onClick={() => setTab("available")}>
          <Zap className="mr-1.5 h-4 w-4" /> Available ({availableTasks.length})
        </Button>
        <Button variant={tab === "my" ? "default" : "outline"} size="sm" onClick={() => setTab("my")}>
          <Briefcase className="mr-1.5 h-4 w-4" /> My Tasks ({myTasks.length})
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-1">{tab === "available" ? "No tasks available" : "No tasks yet"}</h3>
              <p className="text-sm text-muted-foreground">{tab === "available" ? "Check back soon." : "Accept a task to get started."}</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((t) => (
            <Card key={t.id} className="border-border card-hover cursor-pointer" style={{ boxShadow: "var(--card-shadow)" }}
              onClick={() => tab === "my" ? setSelectedId(t.id) : undefined}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.subject && `${t.subject} · `}Due {new Date(t.deadline).toLocaleDateString()}
                      {t.sla_tier && t.sla_tier !== "standard" && ` · ${t.sla_tier.toUpperCase()}`}
                    </p>
                    {t.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {t.budget && (
                      <span className="text-sm font-semibold flex items-center gap-1 text-primary">
                        <DollarSign className="h-3.5 w-3.5" />₦{Number(t.budget).toLocaleString()}
                      </span>
                    )}
                    {tab === "available" ? (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); acceptTask(t.id); }}>Accept</Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          t.status === "in_progress" ? "bg-warn/10 text-warn" :
                          t.status === "submitted" ? "bg-info/10 text-info" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {t.status.replace(/_/g, " ")}
                        </span>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
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
