import { useEffect, useRef, useState } from "react";
import { ChevronDown, CheckCircle2, type LucideIcon } from "lucide-react";

interface ExpandableFeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string; // tailwind gradient classes e.g. "from-blue-500 to-blue-600"
  details: string[];
  isOpen: boolean;
  onToggle: () => void;
  delay?: number;
}

/**
 * ExpandableFeatureCard
 * - Smooth accordion-style expand/collapse using max-height transition
 * - Typewriter effect on inner text triggered ONLY when opened
 * - Resets typed content fully when closed
 * - Subtle hover effects, soft shadow, rounded corners
 */
export function ExpandableFeatureCard({
  icon: Icon,
  title,
  desc,
  color,
  details,
  isOpen,
  onToggle,
  delay = 0,
}: ExpandableFeatureCardProps) {
  // Combine details into one continuous string for typing,
  // but keep them as separate lines via newline markers.
  const fullText = details.join("\n");

  const [typed, setTyped] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  // Typewriter effect — runs only when opened, resets when closed
  useEffect(() => {
    // Cleanup previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isOpen) {
      setTyped("");
      return;
    }

    setTyped("");
    let i = 0;
    // Natural typing: ~35ms per char
    intervalRef.current = setInterval(() => {
      i++;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 35);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, fullText]);

  // Smooth height animation — measure content for max-height transition
  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      // Use scrollHeight + a generous buffer so growing typed text fits
      const update = () => {
        if (contentRef.current) {
          setMaxHeight(`${contentRef.current.scrollHeight + 40}px`);
        }
      };
      update();
      // Re-measure as text grows
      const ro = new ResizeObserver(update);
      ro.observe(contentRef.current);
      return () => ro.disconnect();
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen, typed]);

  const typedLines = typed.split("\n");
  const isTyping = isOpen && typed.length < fullText.length;

  return (
    <div
      className="group relative animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow halo on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-slate-300/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

      <div
        className={`relative rounded-3xl border bg-gradient-to-br from-white/80 to-slate-50/70 backdrop-blur-xl shadow-lg transition-all duration-500 ease-out overflow-hidden ${
          isOpen
            ? "border-blue-400/60 shadow-2xl shadow-blue-500/10 -translate-y-0.5"
            : "border-white/60 hover:border-blue-300/50 hover:shadow-2xl hover:-translate-y-1"
        }`}
      >
        {/* Header (clickable) */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="w-full text-left p-4 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-3xl"
        >
          <div className="flex items-start gap-4">
            <div
              className={`h-10 sm:h-12 w-10 sm:w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md transition-transform duration-300 ${
                isOpen ? "scale-110 rotate-3" : "group-hover:scale-110"
              }`}
            >
              <Icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {desc}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-blue-600 mt-1 shrink-0 transition-transform duration-500 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Accordion body — animated max-height */}
        <div
          style={{
            maxHeight,
            transition: "max-height 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="overflow-hidden"
        >
          <div ref={contentRef} className="px-4 sm:px-6 pb-5 sm:pb-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200/70 to-transparent mb-4" />
            <ul className="space-y-2.5">
              {typedLines.map((line, idx) => {
                // Don't render an empty bullet for trailing empty line
                if (line.length === 0 && idx === typedLines.length - 1) return null;
                const isLastVisible = idx === typedLines.length - 1;
                return (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {line}
                      {isTyping && isLastVisible && (
                        <span
                          className="inline-block w-[2px] h-4 ml-0.5 align-middle bg-blue-600 animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
