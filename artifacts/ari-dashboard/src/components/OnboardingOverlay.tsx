import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldAlert,
  ScanFace,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ari_onboarding_completed";

const STEPS = [
  {
    icon: LayoutDashboard,
    accent: "primary" as const,
    title: "Your Command Center",
    body: "This dashboard gives you a real-time overview of your entire squad — fatigue levels, injury risk scores, and readiness status — so you can make confident decisions before every match and training session.",
    detail:
      "The top metrics update automatically from connected wearables. Cards glow red when a player crosses the high-risk threshold.",
  },
  {
    icon: ShieldAlert,
    accent: "destructive" as const,
    title: "Injury Risk Intelligence",
    body: "Every player is assigned a risk level — High, Medium, or Low — by our AI engine. It combines biomechanical patterns from CV analysis with fatigue data from wearable devices.",
    detail:
      'Fatigue Index is a composite score (0–100%) derived from heart rate variability, sleep quality, and training load. Above 70% means reduced intensity is recommended. Hover any metric with a dotted underline to see its definition.',
  },
  {
    icon: ScanFace,
    accent: "accent" as const,
    title: "Computer Vision Analysis",
    body: "Record or import match and training footage. Our CV engine tracks player movements frame-by-frame, detecting asymmetries, dangerous deceleration patterns, and biomechanical risk factors in real time.",
    detail:
      "After analysis, the AI generates personalized Prevention Protocols — exercise routines designed to address each player's specific risk factors. Find them under the player's profile.",
  },
] as const;

const accentMap = {
  primary: {
    iconBg: "bg-primary/15 border-primary/25",
    iconText: "text-primary",
    dot: "bg-primary",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
  },
  destructive: {
    iconBg: "bg-destructive/15 border-destructive/25",
    iconText: "text-destructive",
    dot: "bg-destructive",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
  },
  accent: {
    iconBg: "bg-accent/15 border-accent/25",
    iconText: "text-accent",
    dot: "bg-accent",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
  },
};

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setNeedsOnboarding(true);
    } catch {
      // localStorage unavailable — skip onboarding
    }
  }, []);

  const complete = useCallback(() => {
    setNeedsOnboarding(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }, []);

  const reset = useCallback(() => {
    setNeedsOnboarding(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { needsOnboarding, complete, reset };
}

export function OnboardingOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const colors = accentMap[current.accent];
  const isLast = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg mx-4"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Skip button */}
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 z-10 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="px-8 pt-10 pb-8">
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className={cn(
                  "h-12 w-12 rounded-xl border flex items-center justify-center",
                  colors.iconBg,
                )}
              >
                <current.icon className={cn("h-6 w-6", colors.iconText)} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {current.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">
              {current.body}
            </p>
            <div className="bg-secondary/50 border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {current.detail}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === step
                      ? cn("w-6 h-2", colors.dot)
                      : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}
              {step === 0 && (
                <button
                  onClick={onComplete}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  Skip tour
                </button>
              )}
              <button
                onClick={isLast ? onComplete : () => setStep(step + 1)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-[0.98]",
                  colors.btn,
                )}
              >
                {isLast ? "Get Started" : "Next"}
                {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
