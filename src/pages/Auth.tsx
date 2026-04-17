import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import { Heart, Mail, Lock, User, ArrowRight } from "lucide-react";
import LoginSuccess from "@/components/LoginSuccess";

export default function Auth() {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { t } = useI18n();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user && roles.length > 0) {
      const isDoctor = roles.includes("doctor");
      const isAdmin = roles.includes("admin");
      const isPatient = roles.includes("patient");
      
      if (isAdmin || isDoctor) {
        navigate("/", { replace: true });
      } else if (isPatient) {
        navigate("/patient", { replace: true });
      }
    } else if (user && roles.length === 0) {
      const timer = setTimeout(() => {
        navigate("/patient", { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, roles, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          toast.error("Email address already registered");
        } else {
          // Attempt to create profile, role, and patient record immediately
          if (data.user?.id) {
            try {
              // Create profile
              await supabase.from("profiles").upsert({
                user_id: data.user.id,
                full_name: fullName,
              }, { onConflict: "user_id" });

              // Determine user role - check metadata first, defaults to patient
              const roleFromMetadata = data.user.user_metadata?.role || "patient";
              const userRole = (roleFromMetadata === "doctor" || roleFromMetadata === "admin") ? roleFromMetadata : "patient";

              // Create user role
              await supabase.from("user_roles").upsert({
                user_id: data.user.id,
                role: userRole,
              }, { onConflict: "user_id,role" });

              // Only create patient record if user is patient role
              if (userRole === "patient") {
                const patientCode = "PT-" + String(Math.floor(Math.random() * 99999)).padStart(5, "0");
                await supabase.from("patients").insert({
                  user_id: data.user.id,
                  patient_code: patientCode,
                  name: fullName || "Patient",
                  age: 0,
                  gender: "unknown",
                });
              }
            } catch (err) {
              console.log("Note: Some records may already exist, continuing...", err);
            }
          }

          toast.success(t('auth.confirmEmail'));
          // Clear form
          setEmail("");
          setPassword("");
          setFullName("");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // After sign in, ensure necessary records exist (but don't override doctor/admin roles)
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          try {
            // Ensure profile exists
            const profileRes = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
            if (!profileRes.data) {
              await supabase.from("profiles").insert({
                user_id: user.id,
                full_name: user.email?.split("@")[0] || "User",
              });
            }

            // Check what roles user has
            const roleRes = await supabase.from("user_roles").select("role").eq("user_id", user.id);
            const existingRoles = (roleRes.data || []).map((r: any) => r.role);
            
            // Only assign patient role if they have NO roles (not doctor/admin)
            if (existingRoles.length === 0) {
              await supabase.from("user_roles").insert({
                user_id: user.id,
                role: "patient",
              });
            }

            // If user is patient, ensure patient record exists
            if (existingRoles.includes("patient") || existingRoles.length === 0) {
              const patientRes = await supabase.from("patients").select("*").eq("user_id", user.id);
              if (!patientRes.data || patientRes.data.length === 0) {
                const patientCode = "PT-" + String(Math.floor(Math.random() * 99999)).padStart(5, "0");
                await supabase.from("patients").insert({
                  user_id: user.id,
                  patient_code: patientCode,
                  name: user.email?.split("@")[0] || "Patient",
                  age: 0,
                  gender: "unknown",
                });
              }
            }
          } catch (err) {
            console.log("Note: Some records may already exist", err);
          }
        }

        setShowSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(t('auth.googleFailed'));
    }
    if (result.redirected) return;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {showSuccess && <LoginSuccess message={t('common.login') + "!"} />}
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('common.appName')}</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? t('auth.login') : t('auth.signup')}
          </p>
        </div>

        {/* Google */}
        <Button variant="outline" className="w-full h-11 rounded-xl" onClick={handleGoogleLogin}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('auth.google')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">{t('common.or')}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('auth.fullName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 h-11 rounded-xl"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-11 rounded-xl"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 h-11 rounded-xl"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
            {loading ? t('common.loading') : mode === "login" ? t('auth.login') : t('auth.signup')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? t('auth.noAccount') : t('auth.haveAccount')}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setEmail("");
              setPassword("");
              setFullName("");
            }}
            className="text-primary font-medium ml-1"
          >
            {mode === "login" ? t('auth.signup') : t('auth.login')}
          </button>
        </p>

        {/* Language Toggle */}
        <div className="flex justify-center pt-4 border-t border-border">
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
