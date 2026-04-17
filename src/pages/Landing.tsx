import { useState, useRef, useEffect } from "react";
import { Heart, ArrowRight, Users, Zap, Shield, BarChart3, Bell, TrendingUp, Activity, Stethoscope, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import LoginDropdown from "@/components/LoginDropdown";

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

  // Lock body scroll when feature panel is open
  useEffect(() => {
    if (expandedFeature !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [expandedFeature]);

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
    const handleScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
            <LoginDropdown />
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
      <section className="relative pt-20 sm:pt-32 pb-8 sm:pb-0 px-4 sm:px-6 overflow-hidden min-h-screen flex items-center justify-center z-10"
        style={{ backgroundImage: `url('/1 (2).png')`, backgroundSize: 'cover', backgroundPosition: 'center', animation: 'zoom-in-out 8s ease-in-out infinite' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-blue-50/80 to-transparent" />
        <div className="w-full max-w-6xl mx-auto relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-1">
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
                <div className="inline-block">
                  <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100/60 px-3 sm:px-4 py-2 rounded-full border border-blue-200/50 neumorphic-badge backdrop-blur-sm">
                    {t('landing.badge')}
                  </span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900">
                    {t('landing.heading1')}
                    <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-slate-600 bg-clip-text text-transparent animate-gradient"> {t('landing.heading2')}</span>
                  </h1>
                  <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-lg">{t('landing.description')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                  <LoginDropdown variant="cta" className="w-full sm:w-auto" />
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-200/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">99.9%</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Uptime</p>
                  </div>
                  <div>
        
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">24/7</p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12 sm:space-y-16">
            <div className="text-center max-w-2xl mx-auto animate-fade-in-up">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 sm:mb-6">
                {t('landing.feature1Title')} <span className="bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">{t('common.appName')}</span>
              </h2>
              <p className="text-sm sm:text-lg text-slate-600">{t('landing.description')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Users, title: t('dashboard.patients'), desc: t('landing.feature1Desc'), color: "from-blue-500 to-blue-600", details: [t('landing.feature1Desc'), t('landing.dataAnalyticsDesc'), t('landing.modernTechDesc')] },
                { icon: Activity, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: "from-cyan-500 to-blue-500", details: [t('landing.feature2Desc'), t('landing.modernTechDesc'), t('landing.feature1Desc')] },
                { icon: BarChart3, title: t('landing.dataAnalytics'), desc: t('landing.dataAnalyticsDesc'), color: "from-blue-600 to-slate-600", details: [t('landing.dataAnalyticsDesc'), t('landing.modernTechDesc'), t('landing.feature2Desc')] },
                { icon: Bell, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: "from-slate-600 to-blue-500", details: [t('landing.feature2Desc'), t('landing.feature1Desc'), t('landing.dataAnalyticsDesc')] },
              ].map((feature, i) => (
                <button
                  type="button"
                  onClick={() => setExpandedFeature(i)}
                  key={i}
                  className="group relative block animate-fade-in-up cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-3xl text-left w-full"
                  style={{ animationDelay: `${i * 100}ms` }}
                  aria-label={feature.title}
                  aria-expanded={expandedFeature === i}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-slate-300/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                  <div
                    className="relative h-full rounded-3xl border border-white/60 bg-gradient-to-br from-white/60 to-slate-50/60 backdrop-blur-xl p-4 sm:p-6 shadow-lg animate-card-breathe transition-[box-shadow,border-color,transform] duration-300 group-hover:border-blue-300/50 group-hover:shadow-2xl group-active:scale-[0.98]"
                    style={{ animationDelay: `${i * 250}ms` }}
                  >
                    <div className={`h-10 sm:h-12 w-10 sm:w-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <feature.icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-blue-600 text-xs sm:text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                      {t('landing.learnMore')}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Expanded Feature Dropdown Panel */}
            {expandedFeature !== null && (() => {
              const features = [
                { icon: Users, title: t('dashboard.patients'), desc: t('landing.feature1Desc'), color: "from-blue-500 to-blue-600", details: [t('landing.feature1Desc'), t('landing.dataAnalyticsDesc'), t('landing.modernTechDesc')] },
                { icon: Activity, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: "from-cyan-500 to-blue-500", details: [t('landing.feature2Desc'), t('landing.modernTechDesc'), t('landing.feature1Desc')] },
                { icon: BarChart3, title: t('landing.dataAnalytics'), desc: t('landing.dataAnalyticsDesc'), color: "from-blue-600 to-slate-600", details: [t('landing.dataAnalyticsDesc'), t('landing.modernTechDesc'), t('landing.feature2Desc')] },
                { icon: Bell, title: t('landing.feature2Title'), desc: t('landing.feature2Desc'), color: "from-slate-600 to-blue-500", details: [t('landing.feature2Desc'), t('landing.feature1Desc'), t('landing.dataAnalyticsDesc')] },
              ];
              const f = features[expandedFeature];
              const Icon = f.icon;
              return (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in"
                    onClick={() => setExpandedFeature(null)}
                  />
                  {/* Dropdown panel from top */}
                  <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-20 sm:pt-24 pb-6 max-h-screen overflow-y-auto">
                    <div
                      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden"
                      style={{ animation: 'slide-down-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {/* Header */}
                      <div className={`relative p-6 sm:p-8 bg-gradient-to-br ${f.color}`}>
                        <button
                          type="button"
                          onClick={() => setExpandedFeature(null)}
                          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                          aria-label="Close"
                        >
                          <X className="h-5 w-5 text-white" />
                        </button>
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">{f.title}</h3>
                            <p className="text-sm sm:text-base text-white/90">{f.desc}</p>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 sm:p-8 space-y-4">
                        <h4 className="text-lg font-bold text-slate-900">{t('landing.learnMore')}</h4>
                        <ul className="space-y-3">
                          {f.details.map((d, idx) => (
                            <li
                              key={`${expandedFeature}-${idx}`}
                              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 opacity-0"
                              style={{
                                animation: `slide-down-fade 500ms cubic-bezier(0.16, 1, 0.3, 1) ${200 + idx * 120}ms forwards`
                              }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{d}</p>
                            </li>
                          ))}
                        </ul>
                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                          <Link
                            to="/auth"
                            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                          >
                            {t('common.login')}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setExpandedFeature(null)}
                            className="flex-1 h-12 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                          >
                            {t('common.close') || 'Close'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

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

        <div className="max-w-6xl mx-auto relative">
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
            <div className="space-y-4 sm:space-y-6 animate-fade-in-up order-1 lg:order-2">
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900">
                {t('landing.modernTech')}
                <span className="block text-blue-600">{t('landing.forBetterResults')}</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{t('landing.modernTechDesc')}</p>
              <div className="space-y-3 sm:space-y-4 pt-2">
                {[t('landing.realtimeAnalytics'), t('landing.predictiveAlerts'), t('landing.cloudStorage')].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm sm:text-base text-slate-700 neumorphic-list">
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
          <div className="relative rounded-3xl border border-white/60 bg-gradient-to-br from-blue-100/40 via-white/40 to-slate-100/40 backdrop-blur-xl overflow-hidden animate-fade-in-up glassmorphic-cta">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-slate-400/20 rounded-full blur-3xl opacity-50" />
            <div className="relative p-8 sm:p-12 lg:p-16 text-center space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4">{t('landing.startToday')}</h2>
                <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto">{t('landing.ctaDesc')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                <LoginDropdown variant="cta" />
                <button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-white/40 text-slate-900 border border-white/60 font-semibold hover:bg-white/60 transition-all backdrop-blur-md neumorphic-button">
                  {t('landing.qualitySummary')}
                </button>
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
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.contact')}</a></li>
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