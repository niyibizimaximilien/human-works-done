import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, TrendingUp, CheckCircle, ThumbsUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ReputationPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    const { data } = await supabase.from("agent_reviews").select("*")
      .eq("agent_id", user!.id).order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  const onTimeCount = reviews.filter(r => r.on_time).length;
  const onTimeRate = totalReviews > 0 ? Math.round((onTimeCount / totalReviews) * 100) : 0;
  const fiveStarRate = totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === 5).length / totalReviews) * 100) : 0;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  const stats = [
    { label: "Avg Rating", value: avgRating.toFixed(1), icon: Star, color: "text-primary" },
    { label: "Total Reviews", value: totalReviews, icon: ThumbsUp, color: "text-info" },
    { label: "On-Time %", value: `${onTimeRate}%`, icon: Clock, color: "text-warn" },
    { label: "5-Star Rate", value: `${fiveStarRate}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-heading font-bold">Reputation</h2>
        <p className="text-muted-foreground text-sm">Your performance metrics and client reviews.</p>
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

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader><CardTitle className="text-sm font-heading">Rating Distribution</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16 shrink-0">
                <span className="text-sm font-medium">{d.star}</span>
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
              </div>
              <Progress value={d.pct} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">{d.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader><CardTitle className="text-sm font-heading">Recent Reviews</CardTitle></CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reviews yet. Complete tasks to earn your first review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex gap-0.5 shrink-0 pt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{r.comment || "No comment"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                      {r.on_time ? (
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          <CheckCircle className="h-2.5 w-2.5 mr-1" /> On time
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-destructive/5 text-destructive border-destructive/20">
                          <Clock className="h-2.5 w-2.5 mr-1" /> Late
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReputationPage;
