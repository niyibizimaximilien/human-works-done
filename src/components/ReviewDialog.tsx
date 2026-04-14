import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReviewDialogProps {
  assignmentId: string;
  agentId: string;
  studentId: string;
  onReviewSubmitted: () => void;
  children: React.ReactNode;
}

const ratingLabels: Record<number, string> = {
  1: "Terrible", 2: "Very Poor", 3: "Poor", 4: "Below Average",
  5: "Average", 6: "Above Average", 7: "Good", 8: "Very Good",
  9: "Excellent", 10: "Outstanding",
};

const CategorySlider = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <Label className="text-xs">{label}</Label>
      <span className="text-xs font-semibold text-primary">{value}/10</span>
    </div>
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 h-2.5 rounded-sm transition-colors ${
            n <= value ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  </div>
);

const ReviewDialog = ({ assignmentId, agentId, studentId, onReviewSubmitted, children }: ReviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [quality, setQuality] = useState(7);
  const [communication, setCommunication] = useState(7);
  const [timeliness, setTimeliness] = useState(7);
  const [accuracy, setAccuracy] = useState(7);
  const [comment, setComment] = useState("");
  const [onTime, setOnTime] = useState(true);
  const [loading, setLoading] = useState(false);

  const overallRating = Math.round((quality + communication + timeliness + accuracy) / 4);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("agent_reviews").insert({
        assignment_id: assignmentId,
        agent_id: agentId,
        student_id: studentId,
        rating: overallRating,
        quality_rating: quality,
        communication_rating: communication,
        timeliness_rating: timeliness,
        accuracy_rating: accuracy,
        comment: comment.trim() || null,
        on_time: onTime,
      });
      if (error) throw error;
      toast({ title: "Review submitted! ⭐" });
      setOpen(false);
      onReviewSubmitted();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Rate this Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex justify-center gap-0.5 mb-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= overallRating ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
              ))}
            </div>
            <p className="text-sm font-semibold">{overallRating}/10 — {ratingLabels[overallRating]}</p>
          </div>

          <CategorySlider label="Work Quality" value={quality} onChange={setQuality} />
          <CategorySlider label="Communication" value={communication} onChange={setCommunication} />
          <CategorySlider label="Timeliness" value={timeliness} onChange={setTimeliness} />
          <CategorySlider label="Accuracy" value={accuracy} onChange={setAccuracy} />

          <div>
            <Label className="text-xs">Comment (optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="How was your experience?" className="mt-1 min-h-[60px]" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Was work delivered on time?</Label>
            <Switch checked={onTime} onCheckedChange={setOnTime} />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full gold-glow">
            <Send className="mr-2 h-4 w-4" /> {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
