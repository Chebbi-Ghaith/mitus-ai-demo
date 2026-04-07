import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useListPlayers } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Users,
  Activity,
  Video,
  User,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaletteItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  href: string;
  category: "page" | "player";
}

const PAGE_ITEMS: PaletteItem[] = [
  { id: "page-dashboard", label: "Dashboard", sublabel: "Squad overview & KPIs", icon: <LayoutDashboard className="h-4 w-4" />, href: "/", category: "page" },
  { id: "page-players", label: "Squad Roster", sublabel: "Player management", icon: <Users className="h-4 w-4" />, href: "/players", category: "page" },
  { id: "page-sessions", label: "Sessions", sublabel: "Training & match logs", icon: <Activity className="h-4 w-4" />, href: "/sessions", category: "page" },
  { id: "page-analysis", label: "CV Analysis", sublabel: "Computer vision feed", icon: <Video className="h-4 w-4" />, href: "/analysis", category: "page" },
  { id: "page-high-risk", label: "High Risk Players", sublabel: "Filter squad by risk", icon: <Users className="h-4 w-4" />, href: "/players?risk=high", category: "page" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { data: players } = useListPlayers();

  // Build items list
  const allItems = useMemo(() => {
    const playerItems: PaletteItem[] = (players || []).map((p) => ({
      id: `player-${p.id}`,
      label: p.name,
      sublabel: `#${p.number} · ${p.position} · ${p.injuryRisk} risk`,
      icon: <User className="h-4 w-4" />,
      href: `/players/${p.id}`,
      category: "player" as const,
    }));
    return [...PAGE_ITEMS, ...playerItems];
  }, [players]);

  // Filter
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12);
    const q = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.sublabel?.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [allItems, query]);

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, query]);

  // Open/close on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const navigate = useCallback(
    (item: PaletteItem) => {
      setOpen(false);
      setQuery("");
      setLocation(item.href);
    },
    [setLocation],
  );

  // Keyboard navigation inside palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  const pages = filtered.filter((i) => i.category === "page");
  const playerResults = filtered.filter((i) => i.category === "player");

  // Build flat render list with section headers for keyboard indexing
  let flatIndex = 0;
  const renderSections: { header?: string; items: { item: PaletteItem; idx: number }[] }[] = [];
  if (pages.length > 0) {
    const section = { header: "Pages", items: pages.map((item) => ({ item, idx: flatIndex++ })) };
    renderSections.push(section);
  }
  if (playerResults.length > 0) {
    const section = { header: "Players", items: playerResults.map((item) => ({ item, idx: flatIndex++ })) };
    renderSections.push(section);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[90] flex items-start justify-center pt-[20vh]"
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search pages and players..."
                className="flex-1 py-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No results for "{query}"
                </p>
              ) : (
                renderSections.map((section) => (
                  <div key={section.header}>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      {section.header}
                    </p>
                    {section.items.map(({ item, idx }) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          idx === selectedIndex
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary/50",
                        )}
                      >
                        <div className={cn(
                          "shrink-0",
                          idx === selectedIndex ? "text-primary" : "text-muted-foreground",
                        )}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          {item.sublabel && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.sublabel}
                            </p>
                          )}
                        </div>
                        {idx === selectedIndex && (
                          <ArrowRight className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">⌘K</kbd>
                toggle
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
