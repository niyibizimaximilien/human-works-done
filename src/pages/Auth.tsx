import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogIn, UserPlus, GraduationCap, Briefcase } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "agent">("student");
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data.user) {
          // Insert role
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: selectedRole,
          });
        }

        toast({
          title: "Check your email",
          description: "We sent you a verification link. Please confirm your email to continue.",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            MR<span className="text-primary">.</span>ASSIGNMENT
          </CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back! Sign in to continue." : "Create your account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>I want to join as</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("student")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                        selectedRole === "student"
                          ? "border-primary bg-primary/10 neon-glow"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <GraduationCap className={`h-6 w-6 ${selectedRole === "student" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${selectedRole === "student" ? "text-foreground" : "text-muted-foreground"}`}>
                        Student
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("agent")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                        selectedRole === "agent"
                          ? "border-primary bg-primary/10 neon-glow"
                          : "border-border bg-card hover:border-muted-foreground"
                      }`}
                    >
                      <Briefcase className={`h-6 w-6 ${selectedRole === "agent" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${selectedRole === "agent" ? "text-foreground" : "text-muted-foreground"}`}>
                        Agent
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@university.edu"
                required
                maxLength={255}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? (
                <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
