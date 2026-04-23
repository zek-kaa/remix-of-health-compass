import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  Bell,
  BarChart3,
  Shield,
  Stethoscope,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

gsap.registerPlugin(ScrollTrigger);

/**
 * FeaturesShowcaseSection
 * --------------------------------------------------------------
 * Premium SaaS-style features section with:
 *  - Scroll hijack (pinned section while user scrolls through features)
 *  - Stacked cards effect (top card slides out, next becomes active)
 *  - Focus mode (active feature is bright + scaled up; others are dim + blurred)
 *  - Side progress indicator (dots) + smooth ease-in-out transitions
 *  - Fully responsive (falls back to a stacked vertical layout on mobile)
 */

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  titleSw: string;
  titleEn: string;
  descSw: string;
  descEn: string;
  // Mock UI illustration shown inside the card
  accent: string; // tailwind gradient class
  metric: { label: string; value: string };
};

const FEATURES: Feature[] = [
  {
    icon: Activity,
    titleSw: "Ufuatiliaji wa Afya",
    titleEn: "Real-Time Health Tracking",
    descSw:
      "Fuatilia mapigo ya moyo, shinikizo la damu, sukari, na vipimo vingine kwa wakati halisi. Pata muhtasari wa hali yako ya afya kila siku.",
    descEn:
      "Track heart rate, blood pressure, glucose and more in real-time. Get a clear daily snapshot of your overall health.",
    accent: "from-blue-500 to-blue-700",
    metric: { label: "BPM", value: "72" },
  },
  {
    icon: BarChart3,
    titleSw: "Uchambuzi wa Akili Bandia",
    titleEn: "AI-Powered Analytics",
    descSw:
      "Algoriti zetu zinachambua data yako na kukupa ushauri wa kibinafsi unaoeleweka — sio nambari tu, bali maana halisi.",
    descEn:
      "Our algorithms analyze your data and turn it into personalized, easy-to-understand insights — not just numbers, but meaning.",
    accent: "from-cyan-500 to-blue-600",
    metric: { label: "Score", value: "92" },
  },
  {
    icon: Bell,
    titleSw: "Tahadhari za Kiakili",
    titleEn: "Smart Alerts & Reminders",
    descSw:
      "Pokea tahadhari za papo hapo pale unapoanza kuonyesha dalili zisizo za kawaida, na vikumbusho vya dawa kwa wakati.",
    descEn:
      "Receive instant alerts when abnormal patterns appear, plus timely reminders for medication and check-ins.",
    accent: "from-blue-600 to-indigo-600",
    metric: { label: "Alerts", value: "3" },
  },
  {
    icon: Shield,
    titleSw: "Usalama wa Hali ya Juu",
    titleEn: "Enterprise-Grade Security",
    descSw:
      "Data yako imefichwa kwa encryption ya kiwango cha benki. Wewe tu ndiye unayeweza kuona taarifa zako za afya.",
    descEn:
      "Your data is protected with bank-level encryption. Only you control who can see your health information.",
    accent: "from-slate-600 to-blue-700",
    metric: { label: "Encrypted", value: "100%" },
  },
  {
    icon: Stethoscope,
    titleSw: "Unganishwa na Madaktari",
    titleEn: "Connected With Doctors",
    descSw:
      "Shiriki taarifa zako moja kwa moja na daktari wako kwa kubofya tu. Mawasiliano ya haraka, matibabu bora.",
    descEn:
      "Share your data with your doctor in a single click. Faster communication, better outcomes.",
    accent: "from-blue-700 to-slate-800",
    metric: { label: "Doctors", value: "24/7" },
  },
];

export default function FeaturesShowcaseSection() {
  const { lang } = useI18n();
  const isSw = lang === "sw";

  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const progressLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return;

    // Skip pinning on small screens — mobile gets a simple stacked layout
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
      const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
      const dots = dotsRef.current.filter(Boolean) as HTMLButtonElement[];
      const total = cards.length;

      // ---- Initial state: stack all cards on top of each other ----
      cards.forEach((card, i) => {
        gsap.set(card, {
          yPercent: i === 0 ? 0 : 8 * i,
          scale: i === 0 ? 1 : 1 - i * 0.04,
          opacity: i === 0 ? 1 : 0.5,
          rotate: i === 0 ? 0 : -1.5,
          filter: i === 0 ? "blur(0px) brightness(1)" : "blur(4px) brightness(0.85)",
          zIndex: total - i,
          transformOrigin: "center center",
        });
      });

      // Initial text state — only first visible
      texts.forEach((t, i) => {
        gsap.set(t, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 40 });
      });

      // ---- Master timeline (scrubbed by scroll) ----
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // Each feature gets ~80% viewport of scroll distance
          end: () => `+=${window.innerHeight * (total - 1) * 0.9}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update side progress line
            if (progressLineRef.current) {
              progressLineRef.current.style.height = `${self.progress * 100}%`;
            }
            // Highlight active dot
            const activeIdx = Math.min(
              total - 1,
              Math.round(self.progress * (total - 1))
            );
            dots.forEach((d, i) => {
              if (!d) return;
              if (i === activeIdx) {
                d.classList.add("is-active");
              } else {
                d.classList.remove("is-active");
              }
            });
          },
        },
      });

      const ease = "power2.inOut";
      const dur = 1;

      // ---- Build sequence: card[i] → card[i+1] ----
      for (let i = 0; i < total - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];
        const currentText = texts[i];
        const nextText = texts[i + 1];

        // Outgoing card slides up & fades out with slight rotation
        tl.to(
          current,
          {
            yPercent: -110,
            scale: 0.92,
            rotate: -4,
            opacity: 0,
            filter: "blur(8px) brightness(0.7)",
            duration: dur,
            ease,
          },
          i // each step at integer label
        );

        // Incoming card snaps into focus
        tl.to(
          next,
          {
            yPercent: 0,
            scale: 1,
            rotate: 0,
            opacity: 1,
            filter: "blur(0px) brightness(1)",
            duration: dur,
            ease,
          },
          i
        );

        // Push everything BEHIND the next card slightly down/dim
        for (let j = i + 2; j < total; j++) {
          tl.to(
            cards[j],
            {
              yPercent: 8 * (j - i - 1),
              scale: 1 - (j - i - 1) * 0.04,
              opacity: 0.5,
              rotate: -1.5,
              filter: "blur(4px) brightness(0.85)",
              duration: dur,
              ease,
            },
            i
          );
        }

        // Text crossfade
        tl.to(currentText, { autoAlpha: 0, y: -40, duration: dur * 0.6, ease }, i);
        tl.to(nextText, { autoAlpha: 1, y: 0, duration: dur * 0.6, ease }, i + 0.2);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Features Showcase"
      className="relative bg-gradient-to-b from-white via-slate-50 to-blue-50/40 overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Decorative bg blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-blue-300/15 blur-3xl" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 rounded-full bg-slate-300/20 blur-3xl" />
      </div>

      <div className="relative h-screen w-full flex items-center px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                {isSw ? "Vipengele" : "Features"}
              </span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
              {isSw ? (
                <>
                  Kila kitu unachohitaji,{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    sehemu moja.
                  </span>
                </>
              ) : (
                <>
                  Everything you need,{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    in one place.
                  </span>
                </>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* LEFT: feature text (only one visible at a time on desktop) */}
            <div className="relative min-h-[260px] lg:min-h-[360px]">
              {/* Desktop: absolute stacked text blocks */}
              <div className="hidden lg:block relative w-full h-full">
                {FEATURES.map((f, i) => (
                  <div
                    key={`text-${i}`}
                    ref={(el) => (textRefs.current[i] = el)}
                    className="absolute inset-0 flex flex-col justify-center will-change-transform"
                  >
                    <FeatureText feature={f} index={i} total={FEATURES.length} isSw={isSw} />
                  </div>
                ))}
              </div>

              {/* Mobile: simple vertical list (no pinning) */}
              <div className="lg:hidden space-y-10">
                {FEATURES.map((f, i) => (
                  <div key={`mtext-${i}`}>
                    <FeatureText feature={f} index={i} total={FEATURES.length} isSw={isSw} />
                    <div className="mt-4">
                      <FeatureMockCard feature={f} isSw={isSw} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: stacked cards (desktop only) */}
            <div
              ref={cardsContainerRef}
              className="hidden lg:block relative h-[500px] xl:h-[560px] w-full"
              style={{ perspective: "1200px" }}
            >
              {FEATURES.map((f, i) => (
                <div
                  key={`card-${i}`}
                  className="feature-card absolute inset-0 will-change-transform"
                >
                  <FeatureMockCard feature={f} isSw={isSw} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side progress indicator (desktop) */}
        <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-20">
          {/* vertical line */}
          <div className="relative w-[2px] h-40 bg-slate-200 rounded-full overflow-hidden">
            <div
              ref={progressLineRef}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"
              style={{ height: "0%" }}
            />
          </div>
          {/* dots */}
          <div className="flex flex-col gap-2 mt-2">
            {FEATURES.map((_, i) => (
              <button
                key={`dot-${i}`}
                ref={(el) => (dotsRef.current[i] = el)}
                aria-label={`Feature ${i + 1}`}
                className={`feature-dot h-2 w-2 rounded-full bg-slate-300 transition-all duration-300 ${
                  i === 0 ? "is-active" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Active dot styles */}
      <style>{`
        .feature-dot.is-active {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: scale(1.6);
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);
        }
      `}</style>
    </section>
  );
}

/* ---------------- sub-components ---------------- */

function FeatureText({
  feature,
  index,
  total,
  isSw,
}: {
  feature: Feature;
  index: number;
  total: number;
  isSw: boolean;
}) {
  const Icon = feature.icon;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-lg shadow-blue-500/25`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs font-bold tracking-widest text-blue-700 uppercase">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-900">
        {isSw ? feature.titleSw : feature.titleEn}
      </h3>
      <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
        {isSw ? feature.descSw : feature.descEn}
      </p>
      <div className="pt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 group cursor-pointer">
        {isSw ? "Jifunze zaidi" : "Learn more"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function FeatureMockCard({ feature, isSw }: { feature: Feature; isSw: boolean }) {
  const Icon = feature.icon;
  return (
    <div className="relative w-full h-full rounded-3xl border-2 border-blue-200 bg-white shadow-2xl shadow-blue-500/15 overflow-hidden">
      {/* Card top accent */}
      <div className={`h-2 w-full bg-gradient-to-r ${feature.accent}`} />

      <div className="p-6 sm:p-8 h-full flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-md`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {isSw ? feature.titleSw : feature.titleEn}
              </p>
              <p className="text-xs text-slate-500">
                {isSw ? "Hai sasa" : "Live now"}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700">
            ● {isSw ? "ACTIVE" : "ACTIVE"}
          </span>
        </div>

        {/* Mock chart / visual area */}
        <div className="mt-6 flex-1 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-100 relative overflow-hidden p-5">
          {/* Big metric */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {feature.metric.label}
              </p>
              <p className="mt-1 text-5xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {feature.metric.value}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{isSw ? "Mwelekeo" : "Trend"}</p>
              <p className="text-sm font-bold text-emerald-600">↗ +12%</p>
            </div>
          </div>

          {/* Faux line chart */}
          <svg
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            className="mt-4 w-full h-16"
          >
            <defs>
              <linearGradient id={`grad-${feature.metric.label}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,40 L20,32 L40,38 L60,22 L80,28 L100,15 L120,20 L140,10 L160,18 L180,8 L200,14 L200,60 L0,60 Z"
              fill={`url(#grad-${feature.metric.label})`}
            />
            <path
              d="M0,40 L20,32 L40,38 L60,22 L80,28 L100,15 L120,20 L140,10 L160,18 L180,8 L200,14"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Mini stat row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { l: isSw ? "Leo" : "Today", v: "98" },
              { l: isSw ? "Wiki" : "Week", v: "92" },
              { l: isSw ? "Mwezi" : "Month", v: "89" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-lg bg-white/70 backdrop-blur-sm border border-slate-100 p-2 text-center"
              >
                <p className="text-[10px] text-slate-500 font-medium">{s.l}</p>
                <p className="text-sm font-bold text-slate-900">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer status pill */}
        <div className="mt-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {isSw ? "Inasasishwa kwa wakati halisi" : "Updating in real-time"}
          </div>
          <span className="font-semibold text-blue-700">
            Afya Compass
          </span>
        </div>
      </div>
    </div>
  );
}
