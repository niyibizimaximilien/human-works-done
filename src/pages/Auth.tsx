import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", newPassword: "" });

  useEffect(() => {
    if (searchParams.get("reset") === "true") setMode("reset");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("user_roles").insert({ user_id: data.user.id, role: "student" as any });
        }
        toast({ title: "Check your email", description: "We sent you a verification link." });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        if (error) throw error;
        toast({ title: "Reset email sent!", description: "Check your inbox for the password reset link." });
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password: form.newPassword });
        if (error) throw error;
        toast({ title: "Password updated!", description: "You can now sign in with your new password." });
        setMode("login");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<string, { title: string; desc: string }> = {
    login: { title: "Welcome back", desc: "Sign in to your account to continue." },
    signup: { title: "Create your account", desc: "Sign up as a student to get started." },
    forgot: { title: "Forgot password?", desc: "Enter your email and we'll send you a reset link." },
    reset: { title: "Set new password", desc: "Choose a new password for your account." },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-border relative z-10 animate-scale-in" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <span className="text-2xl font-heading font-bold">
              MR<span className="text-primary">.</span>ASSIGNMENT
            </span>
          </div>
          <CardTitle className="text-xl font-heading">{titles[mode].title}</CardTitle>
          <CardDescription className="text-sm">{titles[mode].desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="animate-fade-in">
                <Label className="text-xs font-medium">Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="John Doe" required maxLength={100} className="mt-1.5" />
              </div>
            )}
            {mode !== "reset" && (
              <div>
                <Label className="text-xs font-medium">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@university.edu" required maxLength={255} className="mt-1.5" />
              </div>
            )}
            {(mode === "login" || mode === "signup") && (
              <div>
                <Label className="text-xs font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required minLength={6} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {mode === "reset" && (
              <div>
                <Label className="text-xs font-medium">New Password</Label>
                <div className="relative mt-1.5">
                  <Input type={showPassword ? "text" : "password"} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="••••••••" required minLength={6} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full h-11 font-semibold gold-glow" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
              ) : mode === "signup" ? (
                <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
              ) : mode === "forgot" ? (
                <><KeyRound className="mr-2 h-4 w-4" /> Send Reset Link</>
              ) : (
                <><KeyRound className="mr-2 h-4 w-4" /> Update Password</>
              )}
            </Button>
          </form>

          {mode === "login" && (
            <button onClick={() => setMode("forgot")} className="block w-full text-center mt-3 text-xs text-primary hover:underline transition-colors">
              Forgot your password?
            </button>
          )}

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Sign Up</button></>
            ) : mode === "signup" ? (
              <>Already have an account? <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Sign In</button></>
            ) : (
              <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium flex items-center gap-1 mx-auto">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
