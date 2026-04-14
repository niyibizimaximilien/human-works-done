import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, CheckCircle, AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AgentProfileDialogProps {
  agentUserId: string;
  children: React.ReactNode;
}

const AgentProfileDialog = ({ agentUserId, children }: AgentProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      supabase.from("profiles").select("*").eq("user_id", agentUserId).single().then(({ data }) => setProfile(data));
      supabase.from("agent_reviews").select("*").eq("agent_id", agentUserId).order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    }
  }, [open, agentUserId]);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const avgQuality = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.quality_rating || r.rating), 0) / reviews.length : 0;
  const avgComm = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.communication_rating || r.rating), 0) / reviews.length : 0;
  const avgTime = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.timeliness_rating || r.rating), 0) / reviews.length : 0;
  const onTimeRate = reviews.length > 0 ? Math.round(reviews.filter(r => r.on_time).length / reviews.length * 100) : 0;
  const displayName = profile?.nickname ? `@${profile.nickname}` : (profile?.full_name || "Agent");
  const initials = (profile?.nickname || profile?.full_name || "A").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Agent Profile</DialogTitle>
        </DialogHeader>
        {profile && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-heading">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-heading font-semibold">{displayName}</h3>
                {profile.university && <p className="text-xs text-muted-foreground">{profile.university}</p>}
                {profile.department && <p className="text-xs text-muted-foreground">{profile.department}</p>}
                {profile.level && <Badge variant="secondary" className="text-[10px] mt-1">{profile.level}</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <Star className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{avgRating.toFixed(1)}/10</p>
                <p className="text-[9px] text-muted-foreground">Overall</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{reviews.length}</p>
                <p className="text-[9px] text-muted-foreground">Reviews</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{onTimeRate}%</p>
                <p className="text-[9px] text-muted-foreground">On-time</p>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Category Averages</p>
                {[
                  { label: "Quality", value: avgQuality },
                  { label: "Communication", value: avgComm },
                  { label: "Timeliness", value: avgTime },
                ].map(cat => (
                  <div key={cat.label} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">{cat.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(cat.value / 10) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{cat.value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}

            {reviews.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground">Recent Reviews</p>
                {reviews.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-start gap-2 text-xs pb-2 border-b border-border/30 last:border-0">
                    <div className="flex gap-0.5 shrink-0 pt-0.5">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(s => (
                        <Star key={s} className={`h-2 w-2 ${s <= r.rating ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{r.comment || "No comment"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AgentProfileDialog;
