import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRWF } from "@/lib/contactFilter";
import { relativeTime } from "@/lib/relativeTime";
import { TrendingUp, CheckCircle, Clock, Wallet, FileDown } from "lucide-react";
import { PageTransition, StaggerGrid, StaggerItem } from "@/components/MotionWrappers";
import { StatsSkeleton, CardListSkeleton } from "@/components/DashboardSkeleton";

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

  const exportCSV = () => {
    const completed = tasks.filter(t => t.status === "completed");
    if (completed.length === 0) return;
    const csv = [
      "Title,Subject,Budget,Completed Date",
      ...completed.map(t => `"${t.title}","${t.subject || ""}","${t.budget || 0}","${t.reviewed_at || t.updated_at}"`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "earnings.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-6"><StatsSkeleton /><CardListSkeleton /></div>;
  }

  const completed = tasks.filter(t => t.status === "completed");
  const pending = tasks.filter(t => ["in_progress", "submitted"].includes(t.status));
  const totalEarned = completed.reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);
  const pendingEarnings = pending.reduce((s, t) => s + (parseFloat(t.budget) || 0), 0);

  const stats = [
    { label: "Total Earned", value: formatRWF(totalEarned), icon: Wallet, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
    { label: "Pending", value: formatRWF(pendingEarnings), icon: Clock, color: "text-[hsl(var(--warn))]", bg: "bg-[hsl(var(--warn))]/10" },
    { label: "Completed Tasks", value: completed.length, icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Tasks", value: pending.length, icon: TrendingUp, color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10" },
  ];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold">Earnings</h2>
            <p className="text-muted-foreground text-sm">Track your income and payout history.</p>
          </div>
          {completed.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs tap-highlight">
              <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export CSV
            </Button>
          )}
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
                    <p className="text-lg md:text-2xl font-bold font-heading truncate">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="text-sm font-heading">Payout History</CardTitle></CardHeader>
          <CardContent>
            {completed.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No completed tasks yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completed.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.subject && `${t.subject} · `}{relativeTime(t.reviewed_at || t.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-primary">{formatRWF(t.budget)}</span>
                      <Badge variant="outline" className="text-[10px] bg-[hsl(var(--success))]/5 text-[hsl(var(--success))] border-[hsl(var(--success))]/20">Paid</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {pending.length > 0 && (
          <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader><CardTitle className="text-sm font-heading">Pending Earnings (In Escrow)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {pending.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.status.replace(/_/g, " ")} · {relativeTime(t.created_at)}</p>
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--warn))]">{formatRWF(t.budget)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default EarningsPage;
