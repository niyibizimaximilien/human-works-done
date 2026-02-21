import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Upload, Download, Send, Clock, CheckCircle,
  AlertCircle, FileText, DollarSign, MessageSquare, Star,
  Shield, Loader2
} from "lucide-react";

interface AssignmentDetailProps {
  assignmentId: string;
  onBack: () => void;
}

const STATUS_FLOW: Record<string, string[]> = {
  student: [],
  agent: ["submitted"],
};

const SLA_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard (48h)", color: "bg-muted text-muted-foreground" },
  priority: { label: "Priority (12h)", color: "bg-warn/10 text-warn" },
  express: { label: "Express (4h)", color: "bg-destructive/10 text-destructive" },
};

const AssignmentDetail = ({ assignmentId, onBack }: AssignmentDetailProps) => {
  const { user, role } = useAuth();
  const [assignment, setAssignment] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [existingReview, setExistingReview] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAssignment();
    fetchMessages();
    fetchReview();

    const channel = supabase
      .channel(`messages-${assignmentId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `assignment_id=eq.${assignmentId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [assignmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAssignment = async () => {
    const { data } = await supabase.from("assignments").select("*").eq("id", assignmentId).single();
    setAssignment(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*").eq("assignment_id", assignmentId).order("created_at");
    setMessages(data || []);
  };

  const fetchReview = async () => {
    const { data } = await supabase.from("agent_reviews").select("*").eq("assignment_id", assignmentId).maybeSingle();
    setExistingReview(data);
    if (data) { setRating(data.rating); setReviewComment(data.comment || ""); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from("messages").insert({
      assignment_id: assignmentId, sender_id: user!.id, content: newMessage.trim(),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${assignmentId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const urlField = bucket === "assignment-files" ? "file_url" : "deliverable_url";
      await supabase.from("assignments").update({ [urlField]: path }).eq("id", assignmentId);
      toast({ title: "File uploaded" });
      fetchAssignment();
    }
    setUploading(false);
  };

  const downloadFile = async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) { toast({ title: "Download failed", variant: "destructive" }); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url; a.download = path.split("/").pop() || "file"; a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "submitted") updates.submitted_at = new Date().toISOString();
    if (newStatus === "completed") updates.reviewed_at = new Date().toISOString();
    const { error } = await supabase.from("assignments").update(updates).eq("id", assignmentId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Status updated to ${newStatus.replace("_", " ")}` }); fetchAssignment(); }
  };

  const submitReview = async () => {
    if (rating === 0) { toast({ title: "Please select a rating", variant: "destructive" }); return; }
    const { error } = await supabase.from("agent_reviews").insert({
      assignment_id: assignmentId, agent_id: assignment.agent_id,
      student_id: user!.id, rating, comment: reviewComment || null,
      on_time: new Date(assignment.submitted_at || assignment.updated_at) <= new Date(assignment.deadline),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      await updateStatus("completed");
      toast({ title: "Review submitted! Assignment marked complete." });
      fetchReview();
    }
  };

  if (!assignment) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const sla = SLA_LABELS[assignment.sla_tier] || SLA_LABELS.standard;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{assignment.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {assignment.subject && <Badge variant="secondary">{assignment.subject}</Badge>}
                <Badge className={sla.color}>{sla.label}</Badge>
                <Badge variant={assignment.status === "completed" ? "default" : "outline"}>
                  {assignment.status.replace(/_/g, " ")}
                </Badge>
                {assignment.human_verified && (
                  <Badge className="bg-primary/10 text-primary"><Shield className="h-3 w-3 mr-1" /> Human Verified</Badge>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              {assignment.budget && (
                <p className="text-lg font-bold flex items-center gap-1 justify-end text-primary">
                  <DollarSign className="h-4 w-4" />₦{Number(assignment.budget).toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                <Clock className="inline h-3 w-3 mr-1" />Due {new Date(assignment.deadline).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {/* Agent: Submit deliverable */}
            {role === "agent" && assignment.agent_id === user?.id && assignment.status === "in_progress" && (
              <>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "deliverables")} disabled={uploading} />
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span><Upload className="mr-1.5 h-4 w-4" /> {uploading ? "Uploading..." : "Upload Deliverable"}</span>
                  </Button>
                </label>
                {assignment.deliverable_url && (
                  <Button size="sm" onClick={() => updateStatus("submitted")}>
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Submit for Review
                  </Button>
                )}
              </>
            )}

            {/* Student: Upload assignment file */}
            {role === "student" && assignment.student_id === user?.id && assignment.status === "open" && (
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "assignment-files")} disabled={uploading} />
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span><Upload className="mr-1.5 h-4 w-4" /> {uploading ? "Uploading..." : "Attach File"}</span>
                </Button>
              </label>
            )}

            {/* Download buttons */}
            {assignment.file_url && (
              <Button variant="outline" size="sm" onClick={() => downloadFile("assignment-files", assignment.file_url)}>
                <Download className="mr-1.5 h-4 w-4" /> Assignment File
              </Button>
            )}
            {assignment.deliverable_url && (
              <Button variant="outline" size="sm" onClick={() => downloadFile("deliverables", assignment.deliverable_url)}>
                <Download className="mr-1.5 h-4 w-4" /> Deliverable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Section (student, when submitted) */}
      {role === "student" && assignment.student_id === user?.id && assignment.status === "submitted" && !existingReview && (
        <Card className="border-primary/20" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Review & Approve</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="p-1">
                  <Star className={`h-6 w-6 ${s <= rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Input value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Optional comment..." maxLength={500} />
            <div className="flex gap-2">
              <Button onClick={submitReview}><CheckCircle className="mr-1.5 h-4 w-4" /> Approve & Complete</Button>
              <Button variant="outline" onClick={() => updateStatus("in_progress")}>
                <AlertCircle className="mr-1.5 h-4 w-4" /> Request Revision
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {existingReview && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= existingReview.rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{existingReview.comment || "No comment"}</span>
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      {assignment.agent_id && (
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Messages</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Start the conversation.</p>}
              {messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                    m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}>
                    {m.content}
                    <p className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()} maxLength={1000} />
              <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetail;
