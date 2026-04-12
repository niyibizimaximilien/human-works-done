import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        navigate("/dashboard", { replace: true });
      } else if (event === "PASSWORD_RECOVERY") {
        navigate("/auth?reset=true", { replace: true });
      }
    });

    // Fallback redirect after 5s
    const timeout = setTimeout(() => navigate("/auth", { replace: true }), 5000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Verifying your account...</p>
    </div>
  );
};

export default AuthCallback;
