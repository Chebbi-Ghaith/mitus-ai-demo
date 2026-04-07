import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  useListPlayers,
  useCreatePlayer,
  useDeletePlayer,
  useUpdatePlayer,
} from "@workspace/api-client-react";
import {
  Search,
  Plus,
  Activity,
  Users,
  Edit2,
  Trash2,
  X,
  UserPlus,
  AlertTriangle,
  Shield,
  Ruler,
  Scale,
  Dna,
  Loader2,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatRiskColor, formatStatusColor, cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { useI18n } from "@/lib/i18n";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const createPlayerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  number: z.coerce.number().min(1, "Must be > 0").max(99, "Must be < 100"),
  position: z.string().min(2, "Position is required"),
  age: z.coerce
    .number()
    .min(15, "Age must be >= 15")
    .max(50, "Age must be <= 50"),
  nationality: z.string().min(2, "Nationality is required"),
  height: z.coerce.number().min(100, "Min 100cm").max(250, "Max 250cm"),
  weight: z.coerce.number().min(40, "Min 40kg").max(150, "Max 150kg"),
  muscleMass: z.coerce.number().min(10, "Min 10%").max(100, "Max 100%"),
});
type CreatePlayerFormValues = z.infer<typeof createPlayerSchema>;

export default function Players() {
  const {
    data: players,
    isLoading,
    isError,
    error,
    refetch,
  } = useListPlayers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [playerToEdit, setPlayerToEdit] = useState<any>(null);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">(() => {
    const params = new URLSearchParams(window.location.search);
    const risk = params.get("risk");
    if (risk === "high" || risk === "medium" || risk === "low") return risk;
    return "all";
  });
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "injured" | "recovering">("all");
  const [sortBy, setSortBy] = useState<"name" | "risk" | "fatigue" | "position">("name");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const deleteMutation = useDeletePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && e.target instanceof HTMLElement) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const filteredPlayers = useMemo(() => {
    let result = players?.filter(
      (p) =>
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.position.toLowerCase().includes(search.toLowerCase())) &&
        (riskFilter === "all" || p.injuryRisk === riskFilter) &&
        (statusFilter === "all" || p.status === statusFilter),
    ) || [];

    result.sort((a, b) => {
      switch (sortBy) {
        case "risk":
          return (riskOrder[a.injuryRisk] ?? 3) - (riskOrder[b.injuryRisk] ?? 3);
        case "fatigue":
          return (b.wearableData?.fatigue || 0) - (a.wearableData?.fatigue || 0);
        case "position":
          return a.position.localeCompare(b.position);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [players, search, riskFilter, statusFilter, sortBy]);

  const activeFilterCount = (riskFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setRiskFilter("all");
    setStatusFilter("all");
    setSortBy("name");
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {t("players_title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("players_subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t("players_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 py-2.5 rounded-xl bg-secondary border border-white/10 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 hover:border-white/20 transition-all duration-300 w-full sm:w-64 placeholder:text-muted-foreground"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
              <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-white/20 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                /
              </kbd>
            </div>
          </div>

          <CreatePlayerDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSuccess={refetch}
          />
          <EditPlayerDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            player={playerToEdit}
            onSuccess={refetch}
          />
          <DeleteConfirmDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            player={playerToDelete}
            isPending={deleteMutation.isPending}
            onDelete={() => {
              if (playerToDelete) {
                deleteMutation.mutate(
                  { id: playerToDelete.id },
                  {
                    onSuccess: () => {
                      toast({
                        title: "Player removed",
                        description: `${playerToDelete.name} has been removed from the squad.`,
                        variant: "destructive",
                      });
                      setIsDeleteOpen(false);
                      refetch();
                    },
                  },
                );
              }
            }}
          />
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Risk filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mr-1">Risk</span>
          {(["all", "high", "medium", "low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setRiskFilter(level)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 capitalize",
                riskFilter === level
                  ? level === "high"
                    ? "bg-destructive/15 text-destructive border-destructive/30"
                    : level === "medium"
                      ? "bg-warning/15 text-warning border-warning/30"
                      : level === "low"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary/50 text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground",
              )}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mr-1">Status</span>
          {(["all", "active", "injured", "recovering"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 capitalize",
                statusFilter === status
                  ? status === "active"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : status === "injured"
                      ? "bg-destructive/15 text-destructive border-destructive/30"
                      : status === "recovering"
                        ? "bg-warning/15 text-warning border-warning/30"
                        : "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary/50 text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground",
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all duration-200 focus:outline-none focus:border-primary appearance-none cursor-pointer pr-6"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
          >
            <option value="name">Name</option>
            <option value="risk">Risk Level</option>
            <option value="fatigue">Fatigue</option>
            <option value="position">Position</option>
          </select>
        </div>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground/30 transition-all duration-200 ml-auto"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>

      {isError ? (
        <ErrorState
          error={error}
          title="Failed to load players"
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-64 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">{t("players_none_title")}</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {t("players_none_desc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <Link
                href={`/players/${player.id}`}
                className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-3xl transition-shadow"
              >
                <div className={cn(
                  "bg-card border p-6 rounded-xl h-full hover:-translate-y-1 transition-all duration-200 group cursor-pointer relative overflow-hidden",
                  player.injuryRisk === "high"
                    ? "border-destructive/30 hover:border-destructive/50"
                    : player.injuryRisk === "medium"
                      ? "border-warning/20 hover:border-warning/40"
                      : "border-border hover:border-muted-foreground/30",
                )}>
                  {/* Risk severity accent bar */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
                    player.injuryRisk === "high"
                      ? "bg-destructive"
                      : player.injuryRisk === "medium"
                        ? "bg-warning"
                        : "bg-success/50",
                  )} />

                  {/* High-risk ambient glow */}
                  {player.injuryRisk === "high" && (
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-destructive/10 rounded-full blur-[40px] pointer-events-none" />
                  )}

                  <div className="flex justify-between items-start mb-6 mt-1">
                    <div className={cn(
                      "h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-background border-2 flex items-center justify-center shadow-lg shadow-black/30 transition-all duration-200 z-10",
                      player.injuryRisk === "high"
                        ? "border-destructive/30"
                        : "border-border group-hover:border-primary/40",
                    )}>
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="font-display font-bold text-lg text-foreground">
                          {player.number}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 z-10">
                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          formatStatusColor(player.status),
                        )}
                      >
                        {player.status}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-200">
                        <button
                          className="p-2.5 rounded-lg bg-secondary border border-border hover:bg-primary/15 hover:border-primary/30 hover:text-primary text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPlayerToEdit(player);
                            setIsEditOpen(true);
                          }}
                          aria-label={`Edit ${player.name}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2.5 rounded-lg bg-secondary border border-border hover:bg-destructive/15 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPlayerToDelete({
                              id: player.id,
                              name: player.name,
                            });
                            setIsDeleteOpen(true);
                          }}
                          aria-label={`Delete ${player.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={cn(
                      "text-xl font-bold transition-colors truncate",
                      player.injuryRisk === "high"
                        ? "text-foreground group-hover:text-destructive"
                        : "text-foreground group-hover:text-primary",
                    )}>
                      {player.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {player.position} • {player.nationality}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        {t("label_injury_risk")}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-md text-xs font-semibold border inline-block",
                          formatRiskColor(player.injuryRisk),
                        )}
                      >
                        {player.injuryRisk}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                          {t("label_fatigue")}
                        </span>
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {player.wearableData?.fatigue || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            (player.wearableData?.fatigue || 0) > 70
                              ? "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.5)]"
                              : (player.wearableData?.fatigue || 0) > 40
                                ? "bg-warning"
                                : "bg-success",
                          )}
                          style={{ width: `${player.wearableData?.fatigue || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePlayerDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
}) {
  const mutation = useCreatePlayer();
  const { t } = useI18n();

  const form = useForm<CreatePlayerFormValues>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: "",
      number: undefined,
      position: "",
      age: undefined,
      nationality: "",
      height: undefined,
      weight: undefined,
      muscleMass: undefined,
    },
  });

  const onSubmit = (data: CreatePlayerFormValues) => {
    mutation.mutate(
      {
        data,
      },
      {
        onSuccess: () => {
          toast({
            title: "Player added to squad",
            description:
              "The player has been successfully added to the roster.",
            variant: "success",
          });
          form.reset();
          onOpenChange(false);
          onSuccess();
        },
      },
    );
  };

  if (open && !form.formState.isDirty && form.formState.isSubmitSuccessful) {
    form.reset();
  }

  const fields: {
    key: keyof CreatePlayerFormValues;
    label: string;
    placeholder?: string;
    type?: string;
    step?: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "name",
      label: t("field_full_name"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "number",
      label: t("field_jersey_number"),
      type: "number",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: "position",
      label: t("field_position"),
      placeholder: t("field_position_placeholder"),
      icon: <Activity className="h-4 w-4" />,
    },
    {
      key: "age",
      label: t("field_age"),
      type: "number",
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "nationality",
      label: t("field_nationality"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "height",
      label: t("field_height"),
      type: "number",
      step: "0.1",
      icon: <Ruler className="h-4 w-4" />,
    },
    {
      key: "weight",
      label: t("field_weight"),
      type: "number",
      step: "0.1",
      icon: <Scale className="h-4 w-4" />,
    },
    {
      key: "muscleMass",
      label: t("field_muscle_mass"),
      type: "number",
      step: "0.1",
      icon: <Dna className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("players_add")}</span>
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg z-50"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="bg-[#0B1221] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(var(--primary-rgb),0.08)] rounded-3xl overflow-hidden">
                  <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <Dialog.Title className="text-xl font-display font-bold">
                        {t("dialog_add_player_title")}
                      </Dialog.Title>
                    </div>
                    <p className="text-sm text-muted-foreground ml-[52px] -mt-1">
                      Register a new athlete to the active squad roster.
                    </p>
                    <Dialog.Close asChild>
                      <button className="absolute top-5 right-5 h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="px-8 py-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {field.label}
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                              {field.icon}
                            </div>
                            <input
                              type={field.type || "text"}
                              step={field.step}
                              placeholder={field.placeholder}
                              {...form.register(field.key)}
                              className={cn(
                                "w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border outline-none text-sm transition-all duration-300 placeholder:text-muted-foreground/40",
                                form.formState.errors[field.key]
                                  ? "border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/30 bg-destructive/[0.04]"
                                  : "border-white/8 hover:border-primary/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-white/[0.05]",
                              )}
                            />
                          </div>
                          {form.formState.errors[field.key] && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[11px] text-destructive font-medium"
                            >
                              {form.formState.errors[field.key]?.message}
                            </motion.p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-white/5">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground font-medium hover:bg-white/10 hover:text-foreground hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-all duration-300"
                        >
                          {t("btn_cancel")}
                        </button>
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1221] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("btn_creating")}
                          </>
                        ) : (
                          t("btn_save_player")
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function EditPlayerDialog({
  open,
  onOpenChange,
  player,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  player: any;
  onSuccess: () => void;
}) {
  const mutation = useUpdatePlayer();
  const { t } = useI18n();

  const form = useForm<CreatePlayerFormValues>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: "",
      number: undefined,
      position: "",
      age: undefined,
      nationality: "",
      height: undefined,
      weight: undefined,
      muscleMass: undefined,
    },
  });

  useEffect(() => {
    if (player && open) {
      form.reset({
        name: player.name,
        number: player.number,
        position: player.position,
        age: player.age,
        nationality: player.nationality,
        height: player.height,
        weight: player.weight,
        muscleMass: player.muscleMass,
      });
    }
  }, [player, open, form]);

  const onSubmit = (data: CreatePlayerFormValues) => {
    if (!player) return;
    mutation.mutate(
      {
        id: player.id,
        data,
      },
      {
        onSuccess: () => {
          toast({
            title: "Player updated",
            description: "The player details have been successfully updated.",
            variant: "success",
          });
          form.reset();
          onOpenChange(false);
          onSuccess();
        },
      },
    );
  };

  const fields: {
    key: keyof CreatePlayerFormValues;
    label: string;
    placeholder?: string;
    type?: string;
    step?: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "name",
      label: t("field_full_name"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "number",
      label: t("field_jersey_number"),
      type: "number",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: "position",
      label: t("field_position"),
      placeholder: t("field_position_placeholder"),
      icon: <Activity className="h-4 w-4" />,
    },
    {
      key: "age",
      label: t("field_age"),
      type: "number",
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "nationality",
      label: t("field_nationality"),
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "height",
      label: t("field_height"),
      type: "number",
      step: "0.1",
      icon: <Ruler className="h-4 w-4" />,
    },
    {
      key: "weight",
      label: t("field_weight"),
      type: "number",
      step: "0.1",
      icon: <Scale className="h-4 w-4" />,
    },
    {
      key: "muscleMass",
      label: t("field_muscle_mass"),
      type: "number",
      step: "0.1",
      icon: <Dna className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg z-50"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="bg-[#0B1221] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(var(--primary-rgb),0.08)] rounded-3xl overflow-hidden">
                  <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Edit2 className="h-5 w-5 text-primary" />
                      </div>
                      <Dialog.Title className="text-xl font-display font-bold">
                        Edit Player
                      </Dialog.Title>
                    </div>
                    <p className="text-sm text-muted-foreground ml-[52px] -mt-1">
                      Update details for {player?.name}
                    </p>
                    <Dialog.Close asChild>
                      <button className="absolute top-5 right-5 h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="px-8 py-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {field.label}
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
                              {field.icon}
                            </div>
                            <input
                              type={field.type || "text"}
                              step={field.step}
                              placeholder={field.placeholder}
                              {...form.register(field.key)}
                              className={cn(
                                "w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border outline-none text-sm transition-all duration-300 placeholder:text-muted-foreground/40",
                                form.formState.errors[field.key]
                                  ? "border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/30 bg-destructive/[0.04]"
                                  : "border-white/8 hover:border-primary/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-white/[0.05]",
                              )}
                            />
                          </div>
                          {form.formState.errors[field.key] && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[11px] text-destructive font-medium"
                            >
                              {form.formState.errors[field.key]?.message}
                            </motion.p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-white/5">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground font-medium hover:bg-white/10 hover:text-foreground hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-all duration-300"
                        >
                          {t("btn_cancel")}
                        </button>
                      </Dialog.Close>
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1221] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  player,
  onDelete,
  isPending,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  player: { id: number; name: string } | null;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-sm z-50"
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="bg-[#0B1221] border border-destructive/20 shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(var(--destructive-rgb),0.1)] rounded-3xl overflow-hidden">
                  <div className="px-8 pt-8 pb-6 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.08, duration: 0.3 }}
                      className="mx-auto h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5"
                    >
                      <AlertTriangle className="h-7 w-7 text-destructive" />
                    </motion.div>

                    <Dialog.Title className="text-xl font-display font-bold mb-2">
                      Remove Player
                    </Dialog.Title>
                    <p className="text-sm text-muted-foreground mb-1">
                      You are about to remove
                    </p>
                    <p className="text-base font-semibold text-foreground mb-1">
                      {player?.name}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      This action cannot be undone. All associated data
                      including wearable metrics, medical records, and session
                      history will be permanently deleted.
                    </p>
                  </div>

                  <div className="px-8 pb-8 flex gap-3">
                    <Dialog.Close asChild>
                      <button
                        className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground font-medium hover:bg-white/10 hover:text-foreground hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-all duration-300"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={onDelete}
                      disabled={isPending}
                      className="flex-1 px-5 py-3 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-destructive/90 hover:shadow-[0_0_20px_rgba(var(--destructive-rgb),0.3)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1221] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Remove Player
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
