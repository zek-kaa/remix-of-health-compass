import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, ArrowRight, Users, BarChart3, Bell, Activity, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import LoginDropdown from "@/components/LoginDropdown";
import confetti from "canvas-confetti";
import AboutAfyaSection from "@/components/sections/AboutAfyaSection";
import FeaturesShowcaseSection from "@/components/sections/FeaturesShowcaseSection";
import { ExpandableFeatureCard } from "@/components/landing/ExpandableFeatureCard";

interface PhonePosition {
  rotateX: number;
  rotateY: number;
}

export default function Landing() {
  const { t } = useI18n();
  const [phonePos, setPhonePos] = useState<PhonePosition>({ rotateX: 0, rotateY: 0 });
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  // Typewriter state for hero heading + description
  const heading1 = t('landing.heading1');
  const heading2 = t('landing.heading2');
  const description = t('landing.description');
  const [typedH1, setTypedH1] = useState("");
  const [typedH2, setTypedH2] = useState("");
  const [typedDesc, setTypedDesc] = useState("");
  const [typingPhase, setTypingPhase] = useState<"h1" | "h2" | "desc" | "done">("h1");
  const [hasExploded, setHasExploded] = useState(false);
  const ctaWrapperRef = useRef<HTMLDivElement>(null);
  const navLoginRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroMidRef = useRef<HTMLDivElement>(null);
  const heroFgRef = useRef<HTMLDivElement>(null);

  // (No body scroll lock — cards expand inline as accordions)

  // Fire a colorful confetti burst that flies toward the login button(s)
  const fireConfettiToLogin = useCallback(() => {
    const colors = [
      "#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899",
      "#f59e0b", "#10b981", "#ef4444", "#fbbf24",
    ];

    const targets: HTMLElement[] = [];
    if (ctaWrapperRef.current) targets.push(ctaWrapperRef.current);
    if (navLoginRef.current) targets.push(navLoginRef.current);
    if (targets.length === 0) return;

    targets.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Big main burst arriving at the login button
      confetti({
        particleCount: 140,
        spread: 360,
        startVelocity: 45,
        ticks: 200,
        gravity: 0.9,
        scalar: 1.1,
        origin: { x, y },
        colors,
        zIndex: 10000,
        shapes: ["circle", "square"],
      });

      // Secondary sparkle ring
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          startVelocity: 28,
          gravity: 0.6,
          scalar: 0.8,
          origin: { x, y },
          colors,
          zIndex: 10000,
          shapes: ["star"],
        });
      }, 180 + idx * 80);

      // Streamers shooting upward from the button
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 90,
          spread: 70,
          startVelocity: 60,
          gravity: 1.1,
          ticks: 220,
          origin: { x, y: y + 0.02 },
          colors,
          zIndex: 10000,
        });
      }, 280 + idx * 80);
    });
  }, []);

  // Sequential typewriter: heading1 → heading2 → description → confetti
  useEffect(() => {
    const TYPE_SPEED = 55;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const typeText = (text: string, setter: (s: string) => void, onDone: () => void) => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        setter(text.slice(0, i));
        if (i >= text.length) {
          timer = setTimeout(onDone, 280);
          return;
        }
        const jitter = TYPE_SPEED + Math.floor(Math.random() * 40);
        timer = setTimeout(tick, jitter);
      };
      timer = setTimeout(tick, TYPE_SPEED);
    };

    setTypedH1("");
    setTypedH2("");
    setTypedDesc("");
    setHasExploded(false);
    setTypingPhase("h1");

    timer = setTimeout(() => {
      typeText(heading1, setTypedH1, () => {
        setTypingPhase("h2");
        typeText(heading2, setTypedH2, () => {
          setTypingPhase("desc");
          typeText(description, setTypedDesc, () => {
            setTypingPhase("done");
          });
        });
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [heading1, heading2, description]);

  // Trigger confetti once typing finishes
  useEffect(() => {
    if (typingPhase === "done" && !hasExploded) {
      setHasExploded(true);
      // Slight delay so user sees the completed text first
      const t = setTimeout(() => fireConfettiToLogin(), 250);
      return () => clearTimeout(t);
    }
  }, [typingPhase, hasExploded, fireConfettiToLogin]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!phoneContainerRef.current) return;
      const rect = phoneContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = ((e.clientX - centerX) / rect.width) * 15;
      const rotateX = -((e.clientY - centerY) / rect.height) * 15;
      setPhonePos({ rotateX, rotateY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".scroll-reveal"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    const layers = [
      { node: heroBgRef.current, speed: 0.08 },
      { node: heroMidRef.current, speed: 0.16 },
      { node: heroFgRef.current, speed: 0.26 },
    ].filter((item): item is { node: HTMLElement; speed: number } => Boolean(item.node));

    const updateParallax = () => {
      const scrollY = window.scrollY;
      layers.forEach(({ node, speed }) => {
        node.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden selection:bg-blue-100 selection:text-slate-900">
      {/* Custom Cursor */}
      <div className="fixed w-6 h-6 pointer-events-none z-[9999] mix-blend-multiply" style={{ left: `${mousePos.x - 12}px`, top: `${mousePos.y - 12}px` }}>
        <div className="w-3 h-3 bg-blue-500 rounded-full opacity-70 blur-sm" />
        <div className="absolute w-6 h-6 border-2 border-blue-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 glassmorphic-nav border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border border-blue-400/30 shadow-glow neumorphic-button">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <div ref={navLoginRef}>
              <LoginDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl animate-float opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-slate-400/15 blur-3xl animate-float-slow opacity-60" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-blue-300/10 blur-3xl animate-float opacity-50" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-8 sm:pb-0 px-4 sm:px-6 overflow-hidden min-h-screen flex items-center justify-center z-10">
        <div ref={heroBgRef} className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 will-change-transform" style={{ backgroundImage: "url('/1 (2).png')" }} />
        <div ref={heroMidRef} className="absolute -left-24 top-10 w-96 h-96 rounded-full bg-blue-400/12 blur-3xl opacity-70 will-change-transform" />
        <div ref={heroFgRef} className="absolute right-0 bottom-10 w-72 h-72 rounded-full bg-slate-900/10 blur-3xl opacity-80 will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-blue-50/80 to-transparent" />
        <div className="w-full max-w-6xl mx-auto relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-1">
              <div className="space-y-4 sm:space-y-6 scroll-reveal delay-100">
                <div className="inline-block scroll-reveal delay-200">
                  <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100/60 px-3 sm:px-4 py-2 rounded-full border border-blue-200/50 neumorphic-badge backdrop-blur-sm">
                    {t('landing.badge')}
                  </span>
                </div>
                <div className="space-y-3 sm:space-y-4 scroll-reveal delay-300">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900 min-h-[3.5rem] sm:min-h-[7rem]">
                    {typedH1}
                    {typingPhase === "h1" && (
                      <span className="inline-block w-[3px] h-7 sm:h-10 ml-1 align-middle bg-blue-600 animate-pulse" aria-hidden="true" />
                    )}
                    {(typingPhase === "h2" || typingPhase === "desc" || typingPhase === "done") && (
                      <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-slate-600 bg-clip-text text-transparent animate-gradient">
                        {" "}{typedH2}
                        {typingPhase === "h2" && (
                          <span className="inline-block w-[3px] h-7 sm:h-10 ml-1 align-middle bg-blue-600 animate-pulse [-webkit-text-fill-color:initial]" aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </h1>
                  <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-lg min-h-[3rem]">
                    {typedDesc}
                    {typingPhase === "desc" && (
                      <span className="inline-block w-[2px] h-4 ml-1 align-middle bg-blue-600 animate-pulse" aria-hidden="true" />
                    )}
                  </p>
                </div>
                <div ref={ctaWrapperRef} className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4 scroll-reveal delay-400">
                  <LoginDropdown variant="cta" className="w-full sm:w-auto" />
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-200/50 scroll-reveal delay-500">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">99.9%</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Uptime</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">24/7</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Monitoring</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">Trusted</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Worldwide</p>
                  </div>
                </div>
                <div className="mt-8 scroll-reveal delay-600 overflow-hidden">
                  <div className="hero-hero-cards grid grid-cols-4 gap-2">
                    {[
                      {
                        title: "Real-time Monitoring",
                        subtitle: "BP, Sugar, BMI, Sleep",
                        stat: "4 live metrics",
                        tone: "from-blue-500 to-sky-500",
                      },
                      {
                        title: "Risk Screening",
                        subtitle: "Heart, Diabetes, Mental Health",
                        stat: "Low risk",
                        tone: "from-cyan-500 to-blue-600",
                      },
                      {
                        title: "Lifestyle Optimization",
                        subtitle: "Nutrition, Exercise, Hydration",
                        stat: "Personalized plan",
                        tone: "from-emerald-500 to-teal-500",
                      },
                      {
                        title: "Insights & Reports",
                        subtitle: "Trends, Correlations, Alerts",
                        stat: "Weekly summary",
                        tone: "from-blue-600 to-slate-700",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 p-2 sm:p-3 shadow-floating transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow"
                      >
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-white via-blue-50 to-transparent" />
                        <div className="relative z-10 space-y-1">
                          <div className={`inline-flex rounded-2xl bg-gradient-to-br ${item.tone} px-2 py-1 text-white shadow-lg shadow-blue-500/20`}>
                            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em]">{item.title}</span>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-900 leading-tight">{item.subtitle}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-2 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                            {item.stat}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12 sm:space-y-16">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 sm:mb-6">
                {t('landing.feature1Title')} <span className="bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">{t('common.appName')}</span>
              </h2>
              <p className="text-sm sm:text-lg text-slate-600">{t('landing.description')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start scroll-reveal delay-200">
              {[
                {
                  icon: Stethoscope,
                  title: "Health Monitoring",
                  desc: "Track BP, Sugar, BMI and Sleep with daily score insights.",
                  stat: "4 active metrics",
                  details: [
                    "Real-time vitals capture with automatic trend flags.",
                    "Sleep and recovery insight for smarter routine choices.",
                    "Secure summary reports for patients and clinicians.",
                  ],
                  color: "from-blue-500 to-sky-500",
                },
                {
                  icon: Heart,
                  title: "Risk Screening",
                  desc: "Spot heart, diabetes and mental health risks early.",
                  stat: "Risk level: Low",
                  details: [
                    "Predictive screening with personalized risk levels.",
                    "Heart and metabolic health signals in one dashboard.",
                    "Alerts and actionable recommendations for prevention.",
                  ],
                  color: "from-cyan-500 to-blue-500",
                },
                {
                  icon: Activity,
                  title: "Lifestyle Optimization",
                  desc: "Nutrition, exercise and hydration plans tuned daily.",
                  stat: "Plan ready",
                  details: [
                    "Smart guidance for meals, movement and fluid balance.",
                    "Behavioral nudges and performance summaries.",
                    "Integrated support for healthier routines every day.",
                  ],
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  icon: BarChart3,
                  title: "Insights & Reports",
                  desc: "Actionable trends and clinical-quality health reports.",
                  stat: "52 insights/week",
                  details: [
                    "Interactive charts and trend-driven health summaries.",
                    "Correlation reports for lifestyle, sleep and vitals.",
                    "Executive-ready dashboards for care planning.",
                  ],
                  color: "from-blue-600 to-slate-600",
                },
              ].map((feature, i) => (
                <ExpandableFeatureCard
                  key={i}
                  icon={feature.icon}
                  title={feature.title}
                  desc={feature.desc}
                  color={feature.color}
                  stat={feature.stat}
                  details={feature.details}
                  isOpen={expandedFeature === i}
                  onToggle={() =>
                    setExpandedFeature(expandedFeature === i ? null : i)
                  }
                  delay={i * 100}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Afya Compass — Pinned scroll-driven bilingual showcase */}
      <AboutAfyaSection />

      {/* Features Showcase — Pinned scroll hijack with stacked cards & focus mode */}
      <FeaturesShowcaseSection />

      {/* Modern Technology Section with full-width background */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 z-10 overflow-hidden">
        {/* Full-width background image with smooth zoom effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="/2 (2).png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ animation: 'zoom-in-out 8s ease-in-out infinite' }}
          />
          {/* Light themed gradient overlay - keeps image visible while ensuring text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/70 via-blue-50/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
        </div>
        <div className="max-w-6xl mx-auto relative scroll-reveal delay-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="relative h-56 sm:h-96 rounded-3xl overflow-hidden shadow-floating border border-white/50 animate-fade-in-up order-2 lg:order-1">
              <img
                src="/2 (2).png"
                alt="Health Features"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
            </div>
            <div className="space-y-4 sm:space-y-6 scroll-reveal delay-200 order-1 lg:order-2">
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900">
                {t('landing.modernTech')}
                <span className="block text-blue-600">{t('landing.forBetterResults')}</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{t('landing.modernTechDesc')}</p>
              <div className="space-y-3 sm:space-y-4 pt-2">
                {[t('landing.realtimeAnalytics'), t('landing.predictiveAlerts'), t('landing.cloudStorage')].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm sm:text-base text-slate-700 neumorphic-list scroll-reveal"
                    style={{ transitionDelay: `${220 + i * 80}ms` }}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-slate-600 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
              <button className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-glow transition-all hover:shadow-xl hover:-translate-y-1 neumorphic-button">
                {t('landing.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="group relative rounded-3xl overflow-hidden scroll-reveal delay-100 transition-all duration-500 hover:-translate-y-1"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.18) 100%)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.45)",
              boxShadow:
                "0 20px 60px -15px rgba(31, 70, 130, 0.25), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Glass refraction highlights */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70" />
            <div className="pointer-events-none absolute -top-1/2 -left-1/3 w-[160%] h-full rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-2xl opacity-60" />
            <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 bg-blue-400/25 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 w-64 h-64 bg-slate-300/25 rounded-full blur-3xl" />
            {/* Shine sweep on hover */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-md opacity-0 group-hover:opacity-100 group-hover:translate-x-[400%] transition-all duration-1000 ease-out" />
            </div>

            <div className="relative p-8 sm:p-12 lg:p-16 text-center space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4 drop-shadow-sm">{t('landing.startToday')}</h2>
                <p className="text-sm sm:text-lg text-slate-700 max-w-2xl mx-auto">{t('landing.ctaDesc')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                <LoginDropdown variant="cta" />
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex h-12 sm:h-14 items-center justify-center rounded-xl bg-white/80 px-6 sm:px-8 text-slate-900 font-semibold transition-all hover:-translate-y-0.5 hover:bg-white"
                  style={{
                    backdropFilter: "blur(16px) saturate(160%)",
                    WebkitBackdropFilter: "blur(16px) saturate(160%)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow:
                      "0 8px 24px -8px rgba(31, 70, 130, 0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  {t('landing.qualitySummary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/40 backdrop-blur-xl z-10 py-8 sm:py-12 px-4 sm:px-6 bg-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.product')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.features')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.pricing')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.security')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.company')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.about')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.blog')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.careers')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.legal')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.terms')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.contact')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.support')}</a></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition">{t('landing.contact')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/40 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-600">
            <p>{t('landing.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}