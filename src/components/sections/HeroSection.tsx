import { Heart, Users, AlertTriangle, Bell, Calendar, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { useStats, useAppointments } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { getDateLocale } from "@/lib/i18n-utils";
import { useTypingSound } from "@/hooks/useTypingSound";

export function HeroSection() {
  const { profile } = useAuth();
  const { data: stats } = useStats();
  const { data: appointments = [] } = useAppointments();

  const upcoming = appointments.filter(a => a.status === "scheduled").slice(0, 2);
  const { t, lang } = useI18n();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greetingMorning') : hour < 17 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  // Soft procedural typing sound (Web Audio API). Respects browser autoplay
  // policy — only plays after the first user interaction.
  const { playTick, muted, toggleMute } = useTypingSound();

  // Typewriter effect for greeting (with synced sound per character)
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    setTyped("");
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(greeting.slice(0, i));
      // Skip ticks for whitespace so it sounds natural
      const ch = greeting.charAt(i - 1);
      if (ch && ch.trim().length > 0) {
        playTick();
      }
      if (i >= greeting.length) {
        clearInterval(interval);
        setIsTyping(false); // stop sound trigger when done
      }
    }, 75 + Math.floor(Math.random() * 25)); // slight irregularity
    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, [greeting, playTick]);


  const cards = [
    { label: t('dashboard.patients'), value: stats?.totalPatients ?? "—", icon: Users, color: "bg-primary/10 text-primary" },
    { label: t('dashboard.risks'), value: stats?.highRisk ?? "—", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
    { label: t('dashboard.alerts'), value: stats?.activeAlerts ?? "—", icon: Bell, color: "bg-warning/10 text-warning" },
  ];

  return (
    <section className="relative px-5 pt-8 pb-4 overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="absolute top-0 -right-16 w-48 h-48 rounded-full bg-primary/8 blur-3xl animate-float opacity-60" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-info/10 blur-2xl animate-float-slow opacity-60" style={{ animationDelay: "1.5s" }} />

      <div className="relative">

        {/* Main greeting with typewriter effect */}
        <div className="flex items-center gap-2 scroll-fade-in" style={{ animationDelay: "100ms" }}>
          <h1 className="text-3xl font-extrabold text-foreground mt-4 leading-tight min-h-[2.5rem]">
            {typed}
            <span
              className="inline-block w-[3px] h-7 ml-1 align-middle bg-primary animate-pulse"
              aria-hidden="true"
            />
          </h1>
          <Sparkles className="h-7 w-7 text-primary mt-4 pulse-glow" />
        </div>
        <p className="text-sm text-muted-foreground mt-2 scroll-fade-in" style={{ animationDelay: "200ms" }}>
          {profile?.full_name ? `${profile.full_name}, ` : ""}{t('dashboard.yourSummary')}
        </p>
      </div>

      {/* Stats cards with glassmorphism */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="scroll-scale-in rounded-2xl frosted-glass backdrop-blur-xl p-3.5 text-center press-zoom hover-lift border border-primary/25 md:border-primary/20 transition-all shadow-soft md:shadow-sm md:hover:border-primary/40"
            style={{ 
              transitionDelay: `${i * 100}ms`,
              animationDelay: `${i * 100}ms`
            }}
          >
            <div className={`h-9 w-9 mx-auto rounded-xl flex items-center justify-center mb-2 ${card.color} backdrop-blur-sm`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      {upcoming.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 scroll-fade-in" style={{ animationDelay: "300ms" }}>
            <Calendar className="h-3 w-3" /> {t('dashboard.upcomingAppointments')}
          </h3>
          {upcoming.map((a, idx) => (
            <div 
              key={a.id} 
              className="rounded-xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3 flex items-center gap-3 press-zoom hover-lift transition-all scroll-fade-in shadow-soft md:shadow-sm md:hover:border-primary/40"
              style={{ animationDelay: `${400 + idx * 100}ms` }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex flex-col items-center justify-center text-primary shrink-0 backdrop-blur-sm border border-primary/20">
                <span className="text-xs font-bold leading-none">{a.appointment_date.split("-")[2]}</span>
                <span className="text-[8px] uppercase">
                  {new Date(a.appointment_date + "T00:00:00").toLocaleDateString(getDateLocale(lang), { month: "short" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{a.doctor_name || t('auth.doctor')}</p>
                <p className="text-[11px] text-muted-foreground">{a.appointment_time} • {a.reason || t('auth.doctor')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
