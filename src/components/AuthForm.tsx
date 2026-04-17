import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Mail, Lock, User, ArrowRight } from "lucide-react";
import LoginSuccess from "@/components/LoginSuccess";

interface AuthFormProps {
  t: (key: string) => string;
  onSuccess: () => void;
  mode?: "login" | "signup";
  onModeChange?: (newMode: "login" | "signup") => void;
  className?: string;
}

export default function AuthForm({ 
  t, 
  onSuccess, 
  mode: initialMode = "login", 
  onModeChange, 
  className = "" 
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        
        if (data?.user?.identities?.length === 0) {
          toast.error(t('auth.emailRegistered'));
        } else {
          toast.success(t('auth.confirmEmail'));
          resetForm();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
    if (!result.redirected) {
      onSuccess();
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    if (onModeChange) onModeChange("login");
  };

  const toggleMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
    resetForm();
  };

  return (
    <>
    {showSuccess && <LoginSuccess message={t('common.login') + "!"} onDone={onSuccess} />}
    <div className={`space-y-3 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl ${className}`}>
      {/* Google Button */}
      <Button 
        variant="outline" 
        className="w-full h-10 rounded-xl border-2 text-sm" 
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-background/80 px-3 py-1 text-muted-foreground font-medium">{t('common.or')}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {mode === "signup" && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('auth.fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-11 rounded-xl text-sm border-2 focus:border-blue-500"
              required
              disabled={loading}
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
            className="pl-10 h-11 rounded-xl text-sm border-2 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-11 rounded-xl text-sm border-2 focus:border-blue-500"
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl text-sm font-bold !bg-blue-600 hover:!bg-blue-700 !text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2" 
          disabled={loading}
        >
          <span>{loading ? t('common.loading') : (mode === "login" ? t('auth.login') : t('auth.signup'))}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground px-2">
        {mode === "login" ? t('auth.noAccount') : t('auth.haveAccount')}
        <button
          onClick={toggleMode}
          className="text-blue-600 font-semibold ml-1 hover:text-blue-700 transition-colors"
          disabled={loading}
        >
          {mode === "login" ? t('auth.signup') : t('auth.login')}
        </button>
      </p>
    </div>
    </>
  );
}