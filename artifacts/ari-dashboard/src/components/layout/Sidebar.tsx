import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Activity,
  Video,
  Settings,
  Globe,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useI18n, LANGUAGES, type Locale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar({ onReplayOnboarding }: { onReplayOnboarding?: () => void } = {}) {
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

  const currentLang = LANGUAGES.find((l) => l.code === locale)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className="hidden md:flex flex-col border-r border-border bg-card/80 h-screen sticky top-0 transition-[width] duration-300 w-16 lg:w-72">
      {/* Logo */}
      <div className="p-4 lg:p-8 flex items-center gap-3">
        <img
          src="/mitus-logo.png"
          alt="Mitus AI"
          className="h-8 w-8 lg:h-10 lg:w-10 shrink-0"
          style={{ filter: "invert(1)" }}
        />
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-wide">
            Mitus AI<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
            Pro Analytics
          </p>
        </div>
      </div>

      <nav className="flex-1 px-2 lg:px-4 mt-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                      className={cn(
                        "flex items-center gap-4 px-3 lg:px-4 py-3 rounded-lg transition-all duration-200 group relative justify-center lg:justify-start",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium text-sm hidden lg:inline">
                        {item.label}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden bg-card border-border text-foreground">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 lg:p-6" ref={settingsRef}>
        <div className="bg-secondary/50 border border-border p-3 lg:p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
              <span className="font-bold text-xs lg:text-sm text-primary">
                {user
                  ? user.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0 hidden lg:block">
              <p className="text-sm font-semibold text-foreground">
                {user?.name ?? "Coach"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role ?? t("role_head_coach")}
              </p>
            </div>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Toggle settings"
              className={cn(
                "p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hidden lg:flex items-center justify-center",
                settingsOpen
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Settings popover */}
          {settingsOpen && (
            <div className="mt-4 pt-4 border-t border-border hidden lg:block">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("settings_language")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code as Locale);
                      setSettingsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      locale === lang.code
                        ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent",
                    )}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                <span className="text-base leading-none">
                  {currentLang.flag}
                </span>
                <span>{currentLang.label}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-border space-y-1">
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    onReplayOnboarding?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all font-medium"
                >
                  <HelpCircle className="h-4 w-4" />
                  Replay Tour
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/15 transition-all font-medium"
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
