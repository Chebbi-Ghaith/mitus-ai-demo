import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, AlertCircle,
  Globe, Mail, Lock, ArrowLeft, User, BrainCircuit, Zap, Activity, Shield
} from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

type Mode = "signin" | "signup";

const ROLES = [
  { value: "Head Coach", label: "Head Coach" },
  { value: "Fitness Coach", label: "Fitness Coach" },
  { value: "Analytics Coach", label: "Analytics Coach" },
  { value: "Medical Staff", label: "Medical Staff" },
];

const FEATURES = [
  { icon: BrainCircuit, label: "AI Computer Vision", sub: "Real-time movement analysis" },
  { icon: Activity, label: "Injury Risk Engine", sub: "Predict before it happens" },
  { icon: Zap, label: "Wearable Integration", sub: "Whoop · Apple · Oura · Garmin" },
  { icon: Shield, label: "Medical Intelligence", sub: "Player health at a glance" },
];

const DEMOS = [
  { email: "coach@ari.ai", name: "Coach Carter", role: "Head Coach" },
  { email: "mancini@ari.ai", name: "Coach Mancini", role: "Fitness Coach" },
];

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const { locale, setLocale, t } = useI18n();

  const [mode, setMode] = useState<Mode>("signin");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Head Coach");
  const [confirmPass, setConfirmPass] = useState("");

  const clearError = () => setError("");

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    const { ok, error: err } = await login(email, password);
    setLoading(false);
    if (!ok) setError(err ?? "Login failed.");
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPass) { setError("Please fill in all fields."); return; }
    if (password !== confirmPass) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { ok, error: err } = await register(name, email, password, role);
    setLoading(false);
    if (!ok) setError(err ?? "Registration failed.");
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setGoogleLoading(true); setError("");
    const { ok, error: err } = await loginWithGoogle(credentialResponse.credential);
    setGoogleLoading(false);
    if (!ok) setError(err ?? "Google login failed.");
  };

  const switchMode = (m: Mode) => {
    setMode(m); setError("");
    setEmail(""); setPassword(""); setName(""); setConfirmPass("");
  };

  const fillDemo = (demo: { email: string }) => {
    setEmail(demo.email);
    setPassword("coach123");
    setError("");
  };

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 tracking-tight">
                Mitus AI<span className="text-primary">.</span>
              </h1>
            </div>
            <p className="text-sm font-semibold text-primary/80 tracking-[0.3em] uppercase mb-8">
              Sports Intelligence Platform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mb-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
          >
            <img
              src={`${BASE}/images/cv-analysis.gif`}
              alt="CV Analysis"
              className="w-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="bg-[#0B1120] p-4 border-t border-white/5">
              <p className="text-xs text-primary font-semibold uppercase tracking-widest">Live CV Analysis</p>
              <p className="text-white/50 text-sm">Real-time biomechanical tracking</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 w-full max-w-md"
          >
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-y-auto">
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
                  <button key={lang.code} onClick={() => { setLocale(lang.code as Locale); setShowLangMenu(false); }}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                      locale === lang.code ? "bg-primary/15 text-primary font-semibold" : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}>
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-white">Mitus AI<span className="text-primary">.</span></h1>
          </div>

          <AnimatePresence mode="wait">
            {mode === "signin" ? (
              <motion.div key="signin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <h2 className="text-3xl font-display font-bold text-white mb-1">{t("login_title")}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t("login_subtitle")}</p>

                {/* Google Sign In */}
                {GOOGLE_CLIENT_ID && (
                  <>
                    <div className="mb-4">
                      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                        <div className={cn("w-full rounded-xl overflow-hidden border border-white/10", googleLoading && "opacity-50 pointer-events-none")}>
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google login failed.")}
                            width="100%"
                            theme="filled_black"
                            text="continue_with"
                            shape="rectangular"
                            logo_alignment="left"
                          />
                        </div>
                      </GoogleOAuthProvider>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-muted-foreground">or continue with email</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email" value={email} onChange={e => { setEmail(e.target.value); clearError(); }} placeholder="Email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); clearError(); }} placeholder="Password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : t("login_button")}
                  </button>
                </form>

                {/* Demo accounts */}
                <div className="mt-6">
                  <p className="text-xs text-muted-foreground/60 text-center mb-2">Demo accounts (password: coach123)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DEMOS.map(d => (
                      <button key={d.email} onClick={() => fillDemo(d)}
                        className="flex flex-col items-start px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-primary/30 transition-all text-left"
                      >
                        <span className="text-xs font-semibold text-white/80">{d.name}</span>
                        <span className="text-[10px] text-primary/70">{d.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => switchMode("signup")} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Create one
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div key="signup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <button onClick={() => switchMode("signin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-5 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </button>
                <h2 className="text-3xl font-display font-bold text-white mb-1">Create your account.</h2>
                <p className="text-sm text-muted-foreground mb-6">Join Mitus AI and start tracking your squad.</p>

                {error && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text" value={name} onChange={e => { setName(e.target.value); clearError(); }} placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                      required
                    />
                  </div>
                  <select
                    value={role} onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-all text-sm appearance-none"
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value} className="bg-[#0F1A2E]">{r.label}</option>)}
                  </select>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email" value={email} onChange={e => { setEmail(e.target.value); clearError(); }} placeholder="Email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); clearError(); }} placeholder="Password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showConfirm ? "text" : "password"} value={confirmPass} onChange={e => { setConfirmPass(e.target.value); clearError(); }} placeholder="Confirm Password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => switchMode("signin")} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
