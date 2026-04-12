import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TransferDialogProps {
  assignmentId: string;
  currentAgentId: string | null;
  onTransfer: (newAgentId: string, reason: string) => Promise<void>;
  children: React.ReactNode;
}

const TransferDialog = ({ assignmentId, currentAgentId, onTransfer, children }: TransferDialogProps) => {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchAgents();
  }, [open]);

  const fetchAgents = async () => {
    const { data: agentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "agent");
    if (agentRoles) {
      const ids = agentRoles.map(r => r.user_id).filter(id => id !== currentAgentId);
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", ids);
        setAgents(profiles || []);
      }
    }
  };

  const handleTransfer = async () => {
    if (!selectedAgent || !reason.trim()) return;
    setLoading(true);
    await onTransfer(selectedAgent, reason);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" /> Transfer Assignment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Transfer to Agent *</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select agent..." /></SelectTrigger>
              <SelectContent>
                {agents.map(a => (
                  <SelectItem key={a.user_id} value={a.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={a.avatar_url || undefined} />
                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                          {(a.full_name || "A").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {a.full_name || "Agent"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Reason *</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Why is this being transferred?" className="mt-1 min-h-[60px]" />
          </div>
          <Button onClick={handleTransfer} disabled={loading || !selectedAgent || !reason.trim()} className="w-full gold-glow">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
            Transfer Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;
