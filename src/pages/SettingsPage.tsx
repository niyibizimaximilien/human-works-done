import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Save, User, Shield, Camera, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    student_id_number: profile?.student_id_number || "",
    university: profile?.university || "",
    department: profile?.department || "",
    level: profile?.level || "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const path = `avatars/${user!.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("assignment-files").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("assignment-files").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user!.id);
      await refreshProfile();
      toast({ title: "Photo updated!" });
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.student_id_number && !/^22\d{7}$/.test(form.student_id_number)) {
      toast({ title: "Invalid Student ID", description: "Must start with 22 followed by 7 digits.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update(form).eq("user_id", user!.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: "Settings saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-heading font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your profile and account.</p>
      </div>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-heading">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </label>
          </div>
          <div>
            <h3 className="font-heading font-semibold">{profile?.full_name || "Set your name"}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">Role: {role || "student"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-heading">
            <User className="h-5 w-5 text-primary" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Student ID *</Label>
                <Input value={form.student_id_number} onChange={(e) => setForm({ ...form, student_id_number: e.target.value })} placeholder="22XXXXXXX" maxLength={9} className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Format: 22 + 7 digits</p>
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">University</Label>
                <Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} maxLength={200} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} maxLength={200} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Level</Label>
                <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} maxLength={50} className="mt-1" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="gold-glow">
              <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-heading">
            <Shield className="h-5 w-5 text-primary" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-xs text-muted-foreground capitalize">{role || "student"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
