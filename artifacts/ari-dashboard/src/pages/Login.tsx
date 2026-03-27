import { motion } from "framer-motion";
import { Globe, BrainCircuit, Shield, Zap, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const FEATURES = [
  { icon: BrainCircuit, label: "AI Computer Vision", sub: "Real-time movement analysis" },
  { icon: Activity, label: "Injury Risk Engine", sub: "Predict before it happens" },
  { icon: Zap, label: "Wearable Integration", sub: "Whoop · Apple · Oura · Garmin" },
  { icon: Shield, label: "Medical Intelligence", sub: "Player health at a glance" },
];

export default function Login() {
  const { login } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#070E1B]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BASE}/images/pitch-bg.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#070E1B]/70 via-[#0B1120]/50 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070E1B] via-transparent to-transparent" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-32 right-10 w-64 h-64 bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 flex flex-col items-center text-center px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 tracking-tight">
                ARI<span className="text-primary">.</span>
              </h1>
            </div>
            <p className="text-sm font-semibold text-primary/80 tracking-[0.3em] uppercase mb-8">
              Sports Intelligence Platform
            </p>
          </motion.div>

          {/* CV GIF / analysis preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mb-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
          >
            <img
              src={`${BASE}/images/cv-analysis.gif`}
              alt="Computer Vision Analysis"
              className="w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="bg-gradient-to-t from-[#0B1120] to-transparent p-4 -mt-12 relative">
              <p className="text-xs text-primary font-semibold uppercase tracking-widest">Live CV Analysis</p>
              <p className="text-white/70 text-sm">Real-time biomechanical tracking</p>
            </div>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 w-full max-w-md"
          >
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/90 truncate">{f.label}</p>
                  <p className="text-[10px] text-white/40 truncate">{f.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-accent/5" />

        {/* Language switcher */}
        <div className="absolute top-6 right-6 z-20">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <Globe className="h-4 w-4" />
              <span>{LANGUAGES.find(l => l.code === locale)?.flag}</span>
              <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === locale)?.label}</span>
            </button>
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 w-44 rounded-xl bg-[#0F1A2E] border border-white/10 shadow-2xl overflow-hidden z-30">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code as Locale); setShowLangMenu(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                      locale === lang.code
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-white">
              ARI<span className="text-primary">.</span>
            </h1>
          </div>

          <h2 className="text-3xl font-display font-bold text-white mb-2">
            {t("login_title")}
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            {t("login_subtitle")}
          </p>

          {/* Login button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
          >
            <BrainCircuit className="h-5 w-5" />
            {t("login_button")}
          </button>

          <p className="mt-8 text-center text-xs text-muted-foreground/60 leading-relaxed">
            {t("login_secure_note")}
          </p>

          {/* Feature highlights for mobile */}
          <div className="mt-10 lg:hidden space-y-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm text-white/50">
                <f.icon className="h-4 w-4 text-primary/60 shrink-0" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
