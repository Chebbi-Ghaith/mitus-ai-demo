import { useEffect, useRef, useState } from "react";
import {
  Camera, Brain, Shield, AlertTriangle, ChevronRight,
  Play, Star, ArrowRight, Check, Menu, X, Activity,
  Zap, Eye, TrendingDown, Clock, DollarSign
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const PLATFORM_URL = "/";

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useInView(ref: React.RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const FEATURES = [
  {
    icon: Camera,
    title: "Camera Capture",
    desc: "No wearables. No patches. Ariadne plugs into your existing stadium cameras — zero disruption to training."
  },
  {
    icon: Brain,
    title: "AI Movement Analysis",
    desc: "Tracks joint angles, load distribution, and fatigue signatures across every session, flagging risky patterns before symptoms appear."
  },
  {
    icon: Shield,
    title: "Clinical Correction",
    desc: "Alerts go directly to your medical staff with specific correction protocols tailored to each player — before injury occurs."
  }
];

const STATS = [
  { icon: DollarSign, value: 15, suffix: "M+", label: "Average annual salary loss per major injured player" },
  { icon: TrendingDown, value: 67, suffix: "%", label: "Of muscle injuries are preventable with early detection" },
  { icon: Clock, value: 28, suffix: " days", label: "Average time a player misses per soft-tissue injury" }
];

const HOW_IT_WORKS = [
  { num: "01", title: "Pose Estimation", desc: "Every joint tracked at 60fps. Real-time skeleton overlay shows exact biomechanical state during training and matches." },
  { num: "02", title: "Movement Classification", desc: "Sprints, decelerations, jumps, turns — each motion is classified and scored for injury risk in real time." },
  { num: "03", title: "Risk Flagging", desc: "When movement deviates from safe thresholds, the system flags it instantly with severity level and affected muscle group." },
  { num: "04", title: "AI Correction", desc: "Our AI assistant interprets findings and routes correction protocols directly to your medical staff." }
];

const CASE_STUDIES = [
  {
    club: "Juventus FC",
    country: "Serie A, Italy",
    quote: "Ariadne gives our staff visibility they never had before — not just what happened in training, but what is likely to happen next.",
    role: "Performance Director, Juventus FC",
    stats: [
      { value: "94%", label: "Accuracy in identifying high-risk movement patterns" },
      { value: "48hrs", label: "Average early warning time before clinical symptoms" },
      { value: "0", label: "Hardware changes required" }
    ]
  },
  {
    club: "Morocco National Team",
    country: "AFCON Preparation",
    quote: "We entered the tournament with full confidence in each player's physical condition — something we had never had this level of detail on before.",
    role: "Head of Physical Preparation, Morocco NT",
    stats: [
      { value: "26", label: "Players monitored throughout the tournament cycle" },
      { value: "Real-time", label: "Alerts delivered during training sessions" },
      { value: "Match-ready", label: "Data informing lineup and substitution decisions" }
    ]
  }
];

const BETA_PERKS = [
  "Full camera-based movement capture",
  "Real-time injury risk alerts",
  "AI assistant for your medical staff",
  "Dedicated onboarding support",
  "Full season of player data"
];

export default function App() {
  const scrolled = useScrolled();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070E1B] text-white overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#070E1B]/95 backdrop-blur-md border-b border-white/5 shadow-xl shadow-black/20" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <a href={PLATFORM_URL} className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-400/20">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              ARI<span className="text-cyan-400">.</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#solution" className="hover:text-white transition-colors">Solution</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#case-studies" className="hover:text-white transition-colors">Case Studies</a>
            <a href="#beta" className="hover:text-white transition-colors">Free Beta</a>
          </div>

          {/* CTA button */}
          <div className="flex items-center gap-3">
            <a
              href={PLATFORM_URL}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-[#070E1B] font-bold text-sm hover:bg-cyan-300 active:scale-95 transition-all shadow-lg shadow-cyan-400/25"
            >
              Access Platform <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(v => !v)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B1120] border-t border-white/5 px-6 py-4 space-y-3">
            {["#solution", "#how-it-works", "#case-studies", "#beta"].map(href => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-white/60 hover:text-white capitalize transition-colors text-sm">
                {href.replace("#", "").replace("-", " ")}
              </a>
            ))}
            <a href={PLATFORM_URL} className="block w-full text-center px-4 py-3 rounded-xl bg-cyan-400 text-[#070E1B] font-bold text-sm">
              Access Platform
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-400/8 rounded-full blur-[120px] float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px] float-delay pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Football Performance Technology • 2026
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Protect Your Players.<br />
            <span className="gradient-text">Before They Get Hurt.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-powered camera analysis that detects high-risk movement patterns in real time
            — and corrects them before they become injuries. No wearables. No disruption.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="#beta"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#070E1B] font-bold text-base hover:bg-cyan-300 active:scale-95 transition-all shadow-xl shadow-cyan-400/30">
              Get Free Beta Access <ChevronRight className="h-5 w-5" />
            </a>
            <a href={PLATFORM_URL}
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-white/80 font-semibold text-base hover:bg-white/5 hover:text-white hover:border-white/25 transition-all">
              <Play className="h-4 w-4 text-cyan-400" /> Access Platform
            </a>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { v: "3+", l: "Club Partners" },
              { v: "Real-time", l: "Detection" },
              { v: "$0", l: "Cost to Try" }
            ].map(s => (
              <div key={s.l} className="p-4 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm">
                <p className="text-2xl font-black text-cyan-400">{s.v}</p>
                <p className="text-xs text-white/40 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">The Problem</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">
              Injuries Are Football's<br /><span className="gradient-text">Biggest Hidden Cost</span>
            </h2>
            <p className="mt-5 text-white/50 max-w-2xl mx-auto text-lg">
              Clubs spend years building talent — and lose it in seconds. Most non-contact injuries
              stem from movement patterns that accumulate over weeks, invisible to the naked eye.
              Traditional physiotherapy reacts after the injury. By then, the damage is done.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {STATS.map((s, i) => (
              <AnimatedSection key={s.label} style={{ transitionDelay: `${i * 100}ms` } as React.CSSProperties}>
                <div className="p-8 rounded-2xl border border-white/8 bg-white/3 card-glow transition-all duration-300 text-center">
                  <div className="h-12 w-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-5">
                    <s.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-3">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{s.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section id="solution" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/3 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">Our Solution</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black">
              See What <span className="gradient-text">No Human Eye Can</span>
            </h2>
            <p className="mt-5 text-white/50 max-w-2xl mx-auto text-lg">
              Ariadne uses standard stadium cameras to analyze every movement, frame by frame,
              building a biomechanical profile of each player — in real time.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} style={{ transitionDelay: `${i * 120}ms` } as React.CSSProperties}>
                <div className="h-full p-8 rounded-2xl border border-white/8 bg-gradient-to-b from-white/4 to-transparent card-glow transition-all duration-300 group">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400/15 to-violet-500/15 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <f.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-8 p-6 rounded-2xl border border-white/8 bg-white/3 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              <span className="text-white font-semibold">Works alongside your existing clinical staff.</span>{" "}
              Ariadne is a tool, not a replacement. It gives your team the data they need to act sooner.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">How It Works</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black">
              From Camera to <span className="gradient-text">Clinical Action</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <AnimatedSection key={step.num} style={{ transitionDelay: `${i * 100}ms` } as React.CSSProperties}>
                <div className="flex gap-5 p-6 rounded-2xl border border-white/8 bg-white/3 card-glow transition-all duration-300">
                  <span className="text-4xl font-black text-cyan-400/20 leading-none shrink-0 font-mono">{step.num}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CASE STUDIES ─── */}
      <section id="case-studies" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/4 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold text-cyan-400 tracking-widest uppercase">Case Studies</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black">
              Trusted by <span className="gradient-text">Elite Programs</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {CASE_STUDIES.map((cs, i) => (
              <AnimatedSection key={cs.club} style={{ transitionDelay: `${i * 150}ms` } as React.CSSProperties}>
                <div className="h-full flex flex-col p-8 rounded-2xl border border-white/8 bg-white/3 card-glow transition-all duration-300">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{cs.club}</h3>
                      <p className="text-cyan-400 text-sm">{cs.country}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-cyan-400 text-cyan-400" />
                      ))}
                    </div>
                  </div>

                  <blockquote className="text-white/70 italic text-sm leading-relaxed mb-6 border-l-2 border-cyan-400/30 pl-4 flex-1">
                    "{cs.quote}"
                  </blockquote>
                  <p className="text-white/40 text-xs mb-6">— {cs.role}</p>

                  <div className="grid grid-cols-3 gap-3">
                    {cs.stats.map(s => (
                      <div key={s.label} className="p-3 rounded-xl bg-white/4 border border-white/6 text-center">
                        <p className="text-lg font-black text-cyan-400">{s.value}</p>
                        <p className="text-[10px] text-white/40 leading-tight mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Boston pilot badge */}
          <AnimatedSection className="mt-8">
            <div className="p-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <p className="text-white font-semibold text-sm">Active Pilot — Boston College Soccer</p>
                  <p className="text-white/40 text-xs">22 athletes · 60+ sessions analyzed · Full season</p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold">Live Now</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── BETA CTA ─── */}
      <section id="beta" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative p-10 sm:p-16 rounded-3xl border border-white/8 bg-gradient-to-b from-white/5 to-transparent overflow-hidden text-center">
              <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-64 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6">
                  <Zap className="h-3.5 w-3.5" /> Free Beta — Limited Spots
                </div>

                <h2 className="text-4xl sm:text-5xl font-black mb-4">
                  Use Ariadne for <span className="gradient-text">Free</span>.
                </h2>
                <p className="text-white/50 max-w-xl mx-auto mb-10 text-lg">
                  We're offering selected clubs full, no-cost access to our technology for an entire season —
                  in exchange for honest feedback on what works and what to improve.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto mb-10 text-left">
                  {BETA_PERKS.map(p => (
                    <div key={p} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-cyan-400" />
                      </div>
                      <span className="text-white/70 text-sm">{p}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="mailto:nl@estepshealth.com?subject=Beta Access Request - Ariadne"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-400 text-[#070E1B] font-bold text-base hover:bg-cyan-300 active:scale-95 transition-all shadow-xl shadow-cyan-400/30"
                  >
                    Request Beta Access <ChevronRight className="h-5 w-5" />
                  </a>
                  <a
                    href="https://calendar.app.google/eAmuwvsKteW3Aisy9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-white/80 font-semibold text-base hover:bg-white/5 hover:text-white hover:border-white/25 transition-all"
                  >
                    Book a Call
                  </a>
                </div>

                <p className="mt-6 text-white/30 text-sm">$0 total cost · Limited spots available · Full season access</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-lg">ARI<span className="text-cyan-400">.</span></p>
              <p className="text-white/30 text-xs">Sports Intelligence Platform</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-white/40">
            <span>Juventus FC · Morocco NT · Boston College</span>
            <a href="mailto:nl@estepshealth.com" className="hover:text-white transition-colors">nl@estepshealth.com</a>
          </div>

          <a
            href={PLATFORM_URL}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-[#070E1B] font-bold text-sm hover:bg-cyan-300 transition-all"
          >
            Access Platform <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
