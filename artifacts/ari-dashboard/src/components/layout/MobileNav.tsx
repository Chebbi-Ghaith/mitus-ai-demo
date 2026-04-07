import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Activity, Video } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function MobileNav() {
  const [location] = useLocation();
  const { t } = useI18n();

  const navItems = [
    { href: "/", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/players", label: t("nav_squad"), icon: Users },
    { href: "/sessions", label: t("nav_sessions"), icon: Activity },
    { href: "/analysis", label: t("nav_analysis"), icon: Video },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-colors min-w-[4rem] min-h-[44px] justify-center",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area inset for notched phones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
