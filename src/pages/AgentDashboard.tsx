import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase, Clock, CheckCircle, DollarSign,
  FileText, AlertCircle, TrendingUp, Zap
} from "lucide-react";

const AgentDashboard = () => {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [tab, setTab] = useState<"available" | "my">("available");

  useEffect(() => {
    if (user) {
      fetchAvailable();
      fetchMyTasks();
    }
  }, [user]);

  const fetchAvailable = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    setAvailableTasks(data || []);
  };

  const fetchMyTasks = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("agent_id", user!.id)
      .order("created_at", { ascending: false });
    setMyTasks(data || []);
  };

  const acceptTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .update({ agent_id: user!.id, status: "in_progress" })
        .eq("id", id)
        .eq("status", "open");
      if (error) throw error;
      toast({ title: "Task accepted!", description: "You can now start working on this assignment." });
      fetchAvailable();
      fetchMyTasks();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const completedCount = myTasks.filter(t => t.status === "completed").length;
  const totalEarnings = myTasks.filter(t => t.status === "completed").reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);
  const activeCount = myTasks.filter(t => t.status === "in_progress").length;

  const stats = [
    { label: "Available", value: availableTasks.length, icon: Zap, color: "text-info" },
    { label: "Active", value: activeCount, icon: Clock, color: "text-warn" },
    { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-primary" },
    { label: "Earnings", value: `₦${totalEarnings.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
  ];

  const tasks = tab === "available" ? availableTasks : myTasks;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Agent Dashboard</h2>
          <p className="text-muted-foreground text-sm">Find tasks, meet deadlines, and grow your earnings.</p>
        </div>

        {/* Stats */}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={tab === "available" ? "default" : "outline"} size="sm" onClick={() => setTab("available")}>
            <Zap className="mr-1.5 h-4 w-4" /> Available ({availableTasks.length})
          </Button>
          <Button variant={tab === "my" ? "default" : "outline"} size="sm" onClick={() => setTab("my")}>
            <Briefcase className="mr-1.5 h-4 w-4" /> My Tasks ({myTasks.length})
          </Button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-1">
                  {tab === "available" ? "No tasks available" : "No tasks yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tab === "available" ? "Check back soon for new assignments." : "Accept a task to get started."}
                </p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((t) => (
              <Card key={t.id} className="border-border card-hover" style={{ boxShadow: "var(--card-shadow)" }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.subject && `${t.subject} · `}Due {new Date(t.deadline).toLocaleDateString()}
                      </p>
                      {t.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {t.budget && (
                        <span className="text-sm font-semibold flex items-center gap-1 text-primary">
                          <DollarSign className="h-3.5 w-3.5" />₦{t.budget}
                        </span>
                      )}
                      {tab === "available" ? (
                        <Button size="sm" onClick={() => acceptTask(t.id)}>Accept</Button>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          t.status === "in_progress" ? "bg-warn/10 text-warn" : "bg-primary/10 text-primary"
                        }`}>
                          {t.status.replace("_", " ")}
                        </span>
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
