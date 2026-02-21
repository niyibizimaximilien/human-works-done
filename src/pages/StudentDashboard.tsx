import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Upload, Clock, CheckCircle, FileText, Plus, LogOut,
  BookOpen, DollarSign, AlertCircle, X
} from "lucide-react";

const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", deadline: "", budget: "" });

  useEffect(() => {
    if (user) fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("student_id", user!.id)
      .order("created_at", { ascending: false });
    setAssignments(data || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("assignments").insert({
        student_id: user!.id,
        title: form.title,
        description: form.description,
        subject: form.subject,
        deadline: new Date(form.deadline).toISOString(),
        budget: parseFloat(form.budget) || null,
      });
      if (error) throw error;
      toast({ title: "Assignment posted!", description: "Agents will be able to see it now." });
      setShowNew(false);
      setForm({ title: "", description: "", subject: "", deadline: "", budget: "" });
      fetchAssignments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4 text-info" />;
      case "in_progress": return <AlertCircle className="h-4 w-4 text-warn" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const stats = [
    { label: "Total", value: assignments.length, icon: BookOpen, color: "text-primary" },
    { label: "Open", value: assignments.filter(a => a.status === "open").length, icon: Clock, color: "text-info" },
    { label: "In Progress", value: assignments.filter(a => a.status === "in_progress").length, icon: AlertCircle, color: "text-warn" },
    { label: "Completed", value: assignments.filter(a => a.status === "completed").length, icon: CheckCircle, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold">
            MR<span className="text-primary">.</span>ASSIGNMENT
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Student Dashboard</h2>
            <p className="text-muted-foreground text-sm">Manage your assignments and track progress.</p>
          </div>
          <Button onClick={() => setShowNew(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
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

        {/* New Assignment Modal */}
        {showNew && (
          <Card className="mb-8 border-primary/20" style={{ boxShadow: "var(--card-shadow)" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Post New Assignment</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowNew(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" required maxLength={200} />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Physics 201" maxLength={100} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the assignment..." maxLength={1000} />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
                </div>
                <div>
                  <Label>Budget (₦)</Label>
                  <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="5000" min="0" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setShowNew(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    <Upload className="mr-2 h-4 w-4" /> {loading ? "Posting..." : "Post Assignment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-1">No assignments yet</h3>
                <p className="text-sm text-muted-foreground">Post your first assignment to get started.</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((a) => (
              <Card key={a.id} className="border-border card-hover" style={{ boxShadow: "var(--card-shadow)" }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon(a.status)}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.subject && `${a.subject} · `}Due {new Date(a.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.budget && (
                      <span className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />₦{a.budget}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      a.status === "open" ? "bg-info/10 text-info" :
                      a.status === "in_progress" ? "bg-warn/10 text-warn" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {a.status.replace("_", " ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
