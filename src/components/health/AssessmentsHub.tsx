import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/use-auth";
import { useLatestAssessments } from "@/hooks/use-assessments";
import { ASSESSMENT_ORDER, ASSESSMENTS, riskColor, type AssessmentType } from "@/lib/assessments";
import { AssessmentRunner } from "./AssessmentRunner";
import { Salad, Dumbbell, Moon, Droplet, Brain, Heart, Activity, Shield, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNowStrict } from "date-fns";
import { getDateLocale } from "@/lib/i18n-utils";

const ICONS = {
  salad: Salad,
  dumbbell: Dumbbell,
  moon: Moon,
  droplet: Droplet,
  brain: Brain,
  heart: Heart,
  activity: Activity,
  shield: Shield,
};

interface Props {
  /** When provided, renderInline a single assessment runner. */
  initialType?: AssessmentType;
}

export function AssessmentsHub({ initialType }: Props) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const userId = user?.id;
  const { data: latest = {} } = useLatestAssessments(userId);
  const [activeType, setActiveType] = useState<AssessmentType | null>(initialType ?? null);

  if (activeType) {
    return (
      <AssessmentRunner
        type={activeType}
        onClose={() => setActiveType(null)}
      />
    );
  }

  return (
    <div className="space-y-4 py-4 animate-fade-in">
      <div className="rounded-2xl frosted-glass border border-primary/20 p-4 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("assess.hub.heading")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("assess.hub.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {ASSESSMENT_ORDER.map((type) => {
          const def = ASSESSMENTS[type];
          const Icon = ICONS[def.icon];
          const last = latest[type];
          const riskLabel = last
            ? last.risk_level === "low"
              ? t("assess.risk.low")
              : last.risk_level === "moderate"
                ? t("assess.risk.moderate")
                : t("assess.risk.high")
            : null;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className="text-left rounded-2xl frosted-glass border border-border/40 p-4 hover:border-primary/40 hover:shadow-soft transition-all press-zoom group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      {t(def.titleKey)}
                    </p>
                    {last && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${riskColor(last.risk_level)}`}>
                        {riskLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {t(def.subtitleKey)}
                  </p>
                  {last && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {t("assess.hub.score")}: {last.score}
                      </span>
                      <span>·</span>
                      <span>
                        {formatDistanceToNowStrict(new Date(last.created_at), {
                          addSuffix: true,
                          locale: getDateLocale(lang),
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-4 pt-2">
        {t("assess.hub.disclaimer")}
      </p>
    </div>
  );
}
