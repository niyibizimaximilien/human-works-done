import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import PasswordStrength from "@/components/PasswordStrength";

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
        if (error) {
          // Detect unconfirmed email
          if (error.message.toLowerCase().includes("email not confirmed") || error.message.toLowerCase().includes("invalid login")) {
            toast({
              title: "Email not verified",
              description: "Please check your inbox and click the verification link before signing in.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          throw error;
        }
        navigate("/dashboard");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        // Profile and student role are created automatically by the handle_new_user trigger
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast({ title: "Error", description: message, variant: "destructive" });
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
                {mode === "signup" && <PasswordStrength password={form.password} />}
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

          {(mode === "login" || mode === "signup") && (
            <div className="mt-4">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div>
              </div>
              <Button variant="outline" className="w-full h-11" type="button" onClick={async () => {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  toast({ title: "Error", description: result.error.message, variant: "destructive" });
                  return;
                }
                if (result.redirected) return;
                navigate("/dashboard");
              }}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </Button>
            </div>
          )}

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
