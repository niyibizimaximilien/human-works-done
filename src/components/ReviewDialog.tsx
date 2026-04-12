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

const ReviewDialog = ({ assignmentId, agentId, studentId, onReviewSubmitted, children }: ReviewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [onTime, setOnTime] = useState(true);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("agent_reviews").insert({
        assignment_id: assignmentId,
        agent_id: agentId,
        student_id: studentId,
        rating,
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
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                className="p-1 transition-transform hover:scale-125"
              >
                <Star className={`h-7 w-7 ${s <= (hover || rating) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
          <div>
            <Label className="text-xs">Comment (optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="How was the quality?" className="mt-1 min-h-[60px]" />
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
