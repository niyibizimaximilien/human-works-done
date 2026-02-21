import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CheckCircle, Clock, Loader2 } from "lucide-react";

const EarningsPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data } = await supabase.from("assignments").select("*")
      .eq("agent_id", user!.id).order("created_at", { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const completed = tasks.filter(t => t.status === "completed");
  const pending = tasks.filter(t => ["in_progress", "submitted"].includes(t.status));
  const totalEarned = completed.reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);
  const pendingEarnings = pending.reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);

  const stats = [
    { label: "Total Earned", value: `₦${totalEarned.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Pending", value: `₦${pendingEarnings.toLocaleString()}`, icon: Clock, color: "text-warn" },
    { label: "Completed Tasks", value: completed.length, icon: CheckCircle, color: "text-primary" },
    { label: "Active Tasks", value: pending.length, icon: TrendingUp, color: "text-info" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Earnings</h2>
        <p className="text-muted-foreground text-sm">Track your income and payout history.</p>
      </div>

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

      {/* Payout History */}
      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader>
          <CardTitle className="text-sm">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No completed tasks yet. Finish assignments to start earning.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completed.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.subject && `${t.subject} · `}
                      Completed {new Date(t.reviewed_at || t.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-primary">₦{Number(t.budget || 0).toLocaleString()}</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">Paid</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending */}
      {pending.length > 0 && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader>
            <CardTitle className="text-sm">Pending Earnings (In Escrow)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t.status.replace(/_/g, " ")}</p>
                </div>
                <span className="text-sm font-medium text-warn">₦{Number(t.budget || 0).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EarningsPage;
