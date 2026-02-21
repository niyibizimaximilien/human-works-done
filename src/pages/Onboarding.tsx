import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { User, School, BookOpen, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const steps = ["Personal Info", "University", "Subjects"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    university: "",
    department: "",
    level: "",
  });

  const progress = ((step + 1) / steps.length) * 100;

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...form, onboarding_completed: true })
        .eq("user_id", user?.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: "Welcome aboard! 🎉", description: "Your profile is all set." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [User, School, BookOpen];
  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <StepIcon className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">{steps[step]}</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length}</CardDescription>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" maxLength={100} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234..." maxLength={20} />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <Label>University</Label>
                <Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="University of Lagos" maxLength={100} />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" maxLength={100} />
              </div>
              <div>
                <Label>Level</Label>
                <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="300 Level" maxLength={20} />
              </div>
            </>
          )}
          {step === 2 && (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">You're all set!</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is ready. You can always update these details later from your dashboard.
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Go to Dashboard"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
