import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Video, 
  Settings,
  BrainCircuit
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/players", label: "Squad", icon: Users },
    { href: "/sessions", label: "Sessions", icon: Activity },
    { href: "/analysis", label: "CV Analysis", icon: Video },
  ];

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

      <div className="p-6">
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-sm text-primary">MC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Coach Carter</p>
              <p className="text-xs text-muted-foreground">Head Coach</p>
            </div>
            <Settings className="h-4 w-4 ml-auto text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </aside>
  );
}
