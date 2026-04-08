import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { User, School, BookOpen, CheckCircle, ArrowRight, ArrowLeft, Camera, Loader2 } from "lucide-react";

const steps = ["Personal Info", "University", "Complete"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    university: "",
    department: "",
    level: "",
  });

  const progress = ((step + 1) / steps.length) * 100;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const path = `avatars/${user!.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("assignment-files").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("assignment-files").getPublicUrl(path);
      setAvatarUrl(publicUrl);
      toast({ title: "Photo uploaded!" });
    }
    setUploading(false);
  };

  const handleFinish = async () => {
    if (!form.full_name.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...form, avatar_url: avatarUrl || null, onboarding_completed: true })
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

  const initials = form.full_name ? form.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-lg border-border relative z-10 animate-scale-in" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <StepIcon className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-heading font-bold">{steps[step]}</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length}</CardDescription>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="animate-fade-in space-y-4">
              {/* Avatar upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-heading">{initials}</AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Upload a profile photo (required for trust)</p>
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" maxLength={100} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Phone Number</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250..." maxLength={20} className="mt-1" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <div>
                <Label className="text-xs">University</Label>
                <Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="University of Rwanda" maxLength={100} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" maxLength={100} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Level</Label>
                <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Year 3" maxLength={20} className="mt-1" />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="text-center py-6 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold mb-2">You're all set!</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is ready. You can always update these details later from settings.
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
              <Button onClick={() => setStep(step + 1)} className="flex-1 gold-glow">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading} className="flex-1 gold-glow">
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
