import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Loader2, AlertCircle, ChevronRight,
  Globe, User, Mail, Lock, Shield, ArrowLeft
} from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

type Mode = "signin" | "signup";

const ROLES = [
  { value: "head_coach", label: "Head Coach" },
  { value: "fitness_coach", label: "Fitness Coach" },
  { value: "analytics_coach", label: "Analytics Coach" },
  { value: "medical_staff", label: "Medical Staff" },
];

function LoginForm() {
  const { login, register, loginWithGoogle } = useAuth();
  const { locale, setLocale } = useI18n();

  const [mode, setMode] = useState<Mode>("signin");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up extra fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("head_coach");
  const [confirmPass, setConfirmPass] = useState("");

  const clearError = () => setError("");

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    const { ok, error: err } = await login(email, password);
    setLoading(false);
    if (!ok) setError(err ?? "Login failed.");
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPass) { setError("Please fill in all fields."); return; }
    if (password !== confirmPass) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    const { ok, error: err } = await register(name, email, password, role);
    setLoading(false);
    if (!ok) setError(err ?? "Registration failed.");
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setGoogleLoading(true);
    setError("");
    const { ok, error: err } = await loginWithGoogle(credentialResponse.credential);
    setGoogleLoading(false);
    if (!ok) setError(err ?? "Google login failed.");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPass("");
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
            <img src={`${BASE}/images/ari-logo.png`} alt="Ari" className="h-16 w-auto mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.3em]">Pro Analytics Platform</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 mb-10">
            <img src={`${BASE}/demo/ariadne-demo1.gif`} alt="Ari CV Analysis Demo" className="w-full object-cover" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-3">
            {["🎯 Computer Vision Analysis", "⚕️ Injury Risk Prevention", "📊 Real-time Wearables", "🤖 AI Protocols"].map(f => (
              <span key={f} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-muted-foreground backdrop-blur-sm">{f}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">

        {/* Language picker */}
        <div className="absolute top-6 right-6">
          <div className="relative">
            <button onClick={() => setShowLangMenu(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
              <Globe className="h-4 w-4" />
              {LANGUAGES.find(l => l.code === locale)?.flag}
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 4 }} className="absolute right-0 top-full mt-2 bg-[#0B1120] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 min-w-[140px]">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => { setLocale(lang.code as Locale); setShowLangMenu(false); }} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors", locale === lang.code ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
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

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            {mode === "signin" ? (
              <>
                <h1 className="text-3xl font-display font-bold mb-2">Welcome back, Coach.</h1>
                <p className="text-muted-foreground">Sign in to access your squad analytics.</p>
              </>
            ) : (
              <>
                <button onClick={() => switchMode("signin")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </button>
                <h1 className="text-3xl font-display font-bold mb-2">Create your account.</h1>
                <p className="text-muted-foreground">Join the Ari analytics platform.</p>
              </>
            )}
          </div>

          {/* Google OAuth Button */}
          <div className="mb-6">
            {GOOGLE_CLIENT_ID ? (
              <div className={cn("relative", googleLoading && "opacity-60 pointer-events-none")}>
                {googleLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
                <div className="[&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-in was cancelled or failed.")}
                    theme="filled_black"
                    size="large"
                    shape="rectangular"
                    width="400"
                    text={mode === "signup" ? "signup_with" : "signin_with"}
                  />
                </div>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-muted-foreground/50 flex items-center justify-center gap-3 cursor-not-allowed"
                title="Contact your admin to configure Google OAuth"
              >
                <svg className="h-5 w-5 opacity-40" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
                <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5 rounded-md">Not configured</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">

            {/* Sign Up extra fields */}
            {mode === "signup" && (
              <>
                <FormField icon={<User className="h-4 w-4" />} label="Full Name">
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); clearError(); }}
                    placeholder="e.g. Carlo Ancelotti"
                    className={inputClass}
                    autoComplete="name"
                  />
                </FormField>

                <div>
                  <label className={labelClass}>Role</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className={cn(inputClass, "pl-11 appearance-none")}
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <FormField icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                placeholder="coach@ari.ai"
                className={inputClass}
                autoComplete="email"
              />
            </FormField>

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  className={cn(inputClass, "pl-11 pr-12")}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (sign up only) */}
            {mode === "signup" && (
              <FormField icon={<Lock className="h-4 w-4" />} label="Confirm Password">
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPass}
                  onChange={e => { setConfirmPass(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  className={inputClass}
                  autoComplete="new-password"
                />
              </FormField>
            )}

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {mode === "signup" ? "Creating account..." : "Signing in..."}</>
                : <>{mode === "signup" ? "Create Account" : "Sign In"} <ChevronRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Switch mode */}
          {mode === "signin" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-primary font-semibold hover:underline transition-all">
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* Demo hint (signin only) */}
          {mode === "signin" && (
            <div className="mt-4 p-4 rounded-2xl bg-white/3 border border-white/8">
              <p className="text-xs text-muted-foreground text-center mb-3 font-semibold uppercase tracking-wider">Demo Accounts</p>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Coach Carter", email: "coach@ari.ai", role: "Head Coach" },
                  { name: "Coach Mancini", email: "mancini@ari.ai", role: "Fitness Coach" },
                ].map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => { setEmail(acc.email); setPassword("coach123"); clearError(); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {acc.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{acc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{acc.email}</p>
                    </div>
                    <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground font-mono shrink-0">coach123</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8 opacity-50">
            Ari Pro Analytics · © 2025 · AI-Powered Football Intelligence
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Helpers
const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2";
const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all text-sm";

function FormField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">{icon}</span>
        {children}
      </div>
    </div>
  );
}

// Wrap with GoogleOAuthProvider if client ID is available
export default function Login() {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginForm />
      </GoogleOAuthProvider>
    );
  }
  return <LoginForm />;
}
