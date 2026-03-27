import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Video, 
  Settings,
  BrainCircuit,
  ChevronDown
} from "lucide-react";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const { t, locale, setLocale } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/players", label: t("nav_squad"), icon: Users },
    { href: "/sessions", label: t("nav_sessions"), icon: Activity },
    { href: "/analysis", label: t("nav_analysis"), icon: Video },
  ];

  const currentLang = LANGUAGES.find(l => l.code === locale)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className="w-72 hidden md:flex flex-col border-r border-white/5 bg-card/40 backdrop-blur-2xl h-screen sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
          <BrainCircuit className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-wide">
            ARI<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">Pro Analytics</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
              )}
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" : "group-hover:scale-110"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 pb-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setLangOpen(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/60 border border-white/8 hover:border-primary/30 hover:bg-white/5 transition-all group"
          >
            <span className="text-xl leading-none">{currentLang.flag}</span>
            <span className="flex-1 text-left text-sm font-medium text-foreground">{currentLang.label}</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", langOpen && "rotate-180")} />
          </button>

          {langOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 z-50">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLocale(lang.code as Locale); setLangOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5",
                    locale === lang.code ? "text-primary bg-primary/10" : "text-foreground"
                  )}
                >
                  <span className="text-xl leading-none">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                  {locale === lang.code && (
                    <span className="ml-auto text-primary text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-sm text-primary">MC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Coach Carter</p>
              <p className="text-xs text-muted-foreground">{t("role_head_coach")}</p>
            </div>
            <Settings className="h-4 w-4 ml-auto text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </aside>
  );
}
