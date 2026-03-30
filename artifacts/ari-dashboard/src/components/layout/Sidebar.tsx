import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Video, 
  Settings,
  BrainCircuit,
  Globe,
  LogOut
} from "lucide-react";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const { t, locale, setLocale } = useI18n();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/players", label: t("nav_squad"), icon: Users },
    { href: "/sessions", label: t("nav_sessions"), icon: Activity },
    { href: "/analysis", label: t("nav_analysis"), icon: Video },
  ];

  const currentLang = LANGUAGES.find(l => l.code === locale)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
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
            Mitus AI<span className="text-primary">.</span>
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

      <div className="p-6" ref={settingsRef}>
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-sm text-primary">
                {user ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{user?.name ?? "Coach"}</p>
              <p className="text-xs text-muted-foreground">{user?.role ?? t("role_head_coach")}</p>
            </div>
            <button
              onClick={() => setSettingsOpen(v => !v)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                settingsOpen ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              )}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Settings popover */}
          {settingsOpen && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("settings_language")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code as Locale); setSettingsOpen(false); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all",
                      locale === lang.code
                        ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                    )}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span>{currentLang.label}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
