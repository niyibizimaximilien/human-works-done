import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Upload, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface DisputeDialogProps {
  assignmentId: string;
  children: React.ReactNode;
  onDisputeCreated?: () => void;
}

const DisputeDialog = ({ assignmentId, children, onDisputeCreated }: DisputeDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const path = `disputes/${assignmentId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("assignment-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("assignment-files").getPublicUrl(path);
      setEvidenceUrl(publicUrl);
      toast({ title: "Evidence attached" });
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({ title: "Reason required", description: "Please explain why you're opening a dispute.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("disputes").insert({
        assignment_id: assignmentId,
        opened_by: user!.id,
        reason: reason.trim(),
        evidence_url: evidenceUrl,
      });
      if (error) throw error;

      // Update assignment escrow status
      await supabase.from("assignments").update({ escrow_status: "disputed" }).eq("id", assignmentId);

      // Notify admins
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (adminRoles) {
        for (const ar of adminRoles) {
          await supabase.from("notifications").insert({
            user_id: ar.user_id,
            title: "Dispute Opened ⚠️",
            message: `A student has opened a dispute on an assignment.`,
            link: "/dashboard",
          });
        }
      }

      toast({ title: "Dispute opened", description: "An admin will review your dispute." });
      setOpen(false);
      setReason("");
      setEvidenceUrl(null);
      onDisputeCreated?.();
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
          <DialogTitle className="font-heading flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Open Dispute
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you're unsatisfied with the work, describe the issue below. An admin will review the evidence and decide the outcome.
          </p>
          <div>
            <Label className="text-xs">Reason *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              placeholder="Describe the issue..."
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-xs">Evidence (optional)</Label>
            <label className="mt-1 flex items-center gap-2 cursor-pointer">
              <input type="file" className="hidden" onChange={handleEvidenceUpload} disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx" />
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  {evidenceUrl ? "Change file" : "Attach evidence"}
                </span>
              </Button>
              {evidenceUrl && <span className="text-xs text-muted-foreground">File attached ✓</span>}
            </label>
          </div>
          <Button onClick={handleSubmit} disabled={loading} variant="destructive" className="w-full">
            <Send className="mr-2 h-4 w-4" /> {loading ? "Submitting..." : "Submit Dispute"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeDialog;
