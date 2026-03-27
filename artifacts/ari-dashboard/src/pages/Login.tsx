import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, ChevronRight, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const DEMO_ACCOUNTS = [
  { email: "coach@ari.ai", name: "Coach Carter", role: "Head Coach", avatar: "CC" },
  { email: "mancini@ari.ai", name: "Coach Mancini", role: "Fitness Coach", avatar: "CM" },
  { email: "garcia@ari.ai", name: "Coach García", role: "Analytics Coach", avatar: "CG" },
];

export default function Login() {
  const { login } = useAuth();
  const { locale, setLocale } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) setError("Invalid credentials. Try the demo accounts below.");
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[number]) => {
    setEmail(acc.email);
    setPassword("coach123");
    setShowDemo(false);
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#070E1B]">

      {/* ── LEFT PANEL — Brand ── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${BASE}/images/pitch-bg.png)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#070E1B]/70 via-[#0B1120]/50 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070E1B] via-transparent to-transparent" />

        {/* Animated glow orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-32 right-10 w-64 h-64 bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <img src={`${BASE}/images/ari-logo.png`} alt="Ari" className="h-16 w-auto mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.3em]">Pro Analytics Platform</p>
          </motion.div>

          {/* GIF Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 mb-10"
          >
            <img
              src={`${BASE}/demo/ariadne-demo1.gif`}
              alt="Ari CV Analysis Demo"
              className="w-full object-cover"
            />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              "🎯 Computer Vision Analysis",
              "⚕️ Injury Risk Prevention",
              "📊 Real-time Wearables",
              "🤖 AI Protocols",
            ].map(f => (
              <span key={f} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Language switcher top-right */}
        <div className="absolute top-6 right-6">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
            >
              <Globe className="h-4 w-4" />
              {LANGUAGES.find(l => l.code === locale)?.flag}
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  className="absolute right-0 top-full mt-2 bg-[#0B1120] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 min-w-[140px]"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code as Locale); setShowLangMenu(false); }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                        locale === lang.code
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <img src={`${BASE}/images/ari-logo.png`} alt="Ari" className="h-12 w-auto mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Pro Analytics</p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Welcome back, Coach.</h1>
            <p className="text-muted-foreground">Sign in to access your squad analytics.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="coach@ari.ai"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
              ) : (
                <>Sign In <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <button
              onClick={() => setShowDemo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 transition-colors text-sm text-muted-foreground hover:text-foreground group"
            >
              <span className="font-semibold">Demo accounts</span>
              <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">click to expand ↓</span>
            </button>

            <AnimatePresence>
              {showDemo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2">
                    {DEMO_ACCOUNTS.map(acc => (
                      <button
                        key={acc.email}
                        onClick={() => fillDemo(acc)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {acc.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{acc.name}</p>
                          <p className="text-xs text-muted-foreground">{acc.email}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md border border-white/10 font-mono shrink-0">
                          {acc.role}
                        </span>
                      </button>
                    ))}
                    <p className="text-center text-xs text-muted-foreground pt-1">
                      Password for all accounts: <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono">coach123</code>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8 opacity-50">
            Ari Pro Analytics · © 2025 · AI-Powered Football Intelligence
          </p>
        </motion.div>
      </div>
    </div>
  );
}
