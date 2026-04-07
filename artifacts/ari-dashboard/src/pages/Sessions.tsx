import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  useListSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  useListPlayers,
} from "@workspace/api-client-react";
import {
  Plus,
  Video,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Pencil,
  Trash2,
  Upload,
  FileVideo,
  Cpu,
  Ruler,
  Weight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FlaskConical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "@/hooks/use-toast";

const BIOMECHANICS_API =
  (import.meta.env.VITE_BIOMECHANICS_API_URL as string | undefined) ?? "";

const YOLO_OPTIONS = [
  { value: "n", label: "Lite", description: "Fastest" },
  { value: "s", label: "Standard", description: "Balanced" },
  { value: "m", label: "Advanced", description: "Recommended" },
  { value: "l", label: "High-Def", description: "Precise" },
  { value: "x", label: "Clinical", description: "Maximum" },
];

export default function Sessions() {
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useListSessions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBiomechanicsOpen, setIsBiomechanicsOpen] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "training" | "match" | "recovery">("all");
  const { t } = useI18n();

  const filteredSessions = sessions?.filter(
    (s) => typeFilter === "all" || s.type === typeFilter,
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">
            {t("sessions_title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("sessions_subtitle")}</p>
        </div>

        <CreateSessionDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onImportVideo={(sessionData) => {
            setPendingSessionData(sessionData);
            setIsCreateOpen(false);
            setIsBiomechanicsOpen(true);
          }}
        />
        <BiomechanicsUploadModal
          open={isBiomechanicsOpen}
          onOpenChange={setIsBiomechanicsOpen}
          pendingSessionData={pendingSessionData}
          onSuccess={() => refetch()}
        />
      </header>

      {/* Type filter */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mr-1">Type</span>
        {(["all", "training", "match", "recovery"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 capitalize",
              typeFilter === type
                ? type === "match"
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : type === "training"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : type === "recovery"
                      ? "bg-success/15 text-success border-success/30"
                      : "bg-primary/15 text-primary border-primary/30"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-muted-foreground/30 hover:text-foreground",
            )}
          >
            {type === "all" ? "All" : type === "training" ? t("type_training") : type === "match" ? t("type_match") : t("type_recovery")}
          </button>
        ))}
        {typeFilter !== "all" && (
          <button
            onClick={() => setTypeFilter("all")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground/30 transition-all duration-200 ml-auto"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {isError ? (
        <ErrorState
          error={error}
          title="Failed to load training sessions"
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <Video className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">{typeFilter !== "all" ? "No matching sessions" : t("sessions_none_title")}</h3>
          <p className="text-muted-foreground mt-2">
            {typeFilter !== "all" ? `No ${typeFilter} sessions found. Try a different filter.` : t("sessions_none_desc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-card border border-border p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-muted-foreground/30 transition-all group relative overflow-hidden"
            >
              <Link
                href={`/analysis/${session.id}`}
                className="absolute inset-0 z-0"
              />

              <div className="flex items-center gap-6 relative z-10 pointer-events-none">
                <div className="h-14 w-14 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Video className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {session.description}
                    </h3>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border",
                        session.type === "match"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : session.type === "training"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-success/10 text-success border-success/20",
                      )}
                    >
                      {session.type === "training"
                        ? t("type_training")
                        : session.type === "match"
                          ? t("type_match")
                          : t("type_recovery")}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border",
                        session.status === "in-progress"
                          ? "bg-warning/20 text-warning border-warning/30"
                          : "bg-white/5 text-muted-foreground border-white/10",
                      )}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4" />{" "}
                      {format(new Date(session.date), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {session.duration} mins
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {session.playerIds.length}{" "}
                      {t("sessions_players_tracked")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right relative z-10 flex items-center justify-end gap-3">
                <EditSessionDialog session={session} onSuccess={refetch} />
                <DeleteSessionDialog session={session} onSuccess={refetch} />
                <Link href={`/analysis/${session.id}`}>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:translate-x-1 transition-transform ml-3 border border-primary/20 bg-primary/10 px-3 py-1.5 rounded-xl cursor-pointer">
                    {t("sessions_view_analysis")} &rarr;
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSessionDialog({
  open,
  onOpenChange,
  onImportVideo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImportVideo: (data: any) => void;
}) {
  const mutation = useCreateSession();
  const { data: players } = useListPlayers();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"record" | "import">("record");
  const { t } = useI18n();

  const togglePlayer = (playerId: number) => {
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const sessionData = {
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      date: new Date().toISOString(),
      duration: parseInt(formData.get("duration") as string),
      playerIds: selectedPlayerId ? [selectedPlayerId] : [],
    };

    if (actionType === "import") {
      onImportVideo(sessionData);
      return;
    }

    mutation.mutate(
      { data: sessionData },
      {
        onSuccess: () => {
          setSelectedPlayerId(null);
          toast({
            title: "Session recording started",
            description: "AI analysis will begin processing movement data.",
            variant: "primary",
          });
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">
          <Plus className="h-4 w-4" /> {t("sessions_create")}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-white/10 shadow-2xl rounded-3xl z-50 animate-in zoom-in-95 duration-200">
          <div className="px-8 pt-8 pb-4 border-b border-white/5 shrink-0">
            <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-3">
              <Video className="h-6 w-6 text-primary" />{" "}
              {t("dialog_new_session_title")}
            </Dialog.Title>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  {t("field_session_title")}{" "}
                  <span aria-hidden="true" className="text-destructive ml-0.5">
                    *
                  </span>
                </label>
                <input
                  required
                  aria-required="true"
                  name="description"
                  placeholder={t("field_session_title_placeholder")}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("field_type")}
                  </label>
                  <select
                    name="type"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground appearance-none"
                  >
                    <option value="training">{t("type_training")}</option>
                    <option value="match">{t("type_match")}</option>
                    <option value="recovery">{t("type_recovery")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("field_duration")}{" "}
                    <span
                      aria-hidden="true"
                      className="text-destructive ml-0.5"
                    >
                      *
                    </span>
                  </label>
                  <input
                    required
                    aria-required="true"
                    type="number"
                    name="duration"
                    defaultValue={90}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Player <span className="text-destructive">*</span>
                  </label>
                  {selectedPlayerId && (
                    <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-2 py-1 rounded-md">
                      Player Selected
                    </span>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-secondary/30 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {players && players.length > 0 ? (
                      players.map((player) => {
                        const isSelected = selectedPlayerId === player.id;
                        return (
                          <button
                            type="button"
                            key={player.id}
                            onClick={() => togglePlayer(player.id)}
                            className={cn(
                              "flex items-center text-left gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border",
                              isSelected
                                ? "bg-primary/10 border-primary/30"
                                : "bg-secondary/50 border-transparent hover:bg-secondary hover:border-border",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold text-xs",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card text-muted-foreground",
                              )}
                            >
                              {player.number}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span
                                className={cn(
                                  "text-sm font-semibold block truncate transition-colors",
                                  isSelected
                                    ? "text-primary"
                                    : "text-foreground",
                                )}
                              >
                                {player.name}
                              </span>
                              <span className="text-xs text-muted-foreground block truncate mt-0.5">
                                {player.position}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-white/20 bg-transparent",
                              )}
                            >
                              {isSelected && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-primary-foreground"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                        No players in your squad yet. Add players first.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-white/10 transition-colors"
                  >
                    {t("btn_cancel")}
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  onClick={() => setActionType("import")}
                  disabled={mutation.isPending || !selectedPlayerId}
                  className="px-6 py-2.5 rounded-xl bg-secondary text-foreground border border-white/10 font-bold hover:bg-white/10 transition-all disabled:opacity-30"
                >
                  {mutation.isPending && actionType === "import"
                    ? t("btn_starting")
                    : t("btn_import_video")}
                </button>
                <button
                  type="submit"
                  onClick={() => setActionType("record")}
                  disabled={mutation.isPending || !selectedPlayerId}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-30"
                >
                  {mutation.isPending && actionType === "record"
                    ? t("btn_starting")
                    : t("btn_record_video")}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditSessionDialog({
  session,
  onSuccess,
}: {
  session: any;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateSession();
  const { data: players } = useListPlayers();
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>(
    session.playerIds || [],
  );
  const { t } = useI18n();

  const togglePlayer = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate(
      {
        id: session.id,
        data: {
          description: formData.get("description") as string,
          type: formData.get("type") as any,
          date: session.date,
          duration: parseInt(formData.get("duration") as string),
          playerIds: selectedPlayers,
          status: session.status,
        } as any,
      },
      {
        onSuccess: () => {
          toast({
            title: "Session updated",
            description: "Session details have been saved.",
            variant: "primary",
          });
          setOpen(false);
          onSuccess();
        },
      },
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-white/10 shadow-2xl rounded-3xl z-50 animate-in zoom-in-95 duration-200">
          <div className="px-8 pt-8 pb-4 border-b border-white/5 shrink-0">
            <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-3">
              <Pencil className="h-6 w-6 text-primary" /> Edit Session
            </Dialog.Title>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  {t("field_session_title")}{" "}
                  <span aria-hidden="true" className="text-destructive ml-0.5">
                    *
                  </span>
                </label>
                <input
                  required
                  name="description"
                  defaultValue={session.description}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("field_type")}
                  </label>
                  <select
                    name="type"
                    defaultValue={session.type}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground appearance-none"
                  >
                    <option value="training">{t("type_training")}</option>
                    <option value="match">{t("type_match")}</option>
                    <option value="recovery">{t("type_recovery")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("field_duration")}{" "}
                    <span
                      aria-hidden="true"
                      className="text-destructive ml-0.5"
                    >
                      *
                    </span>
                  </label>
                  <input
                    required
                    type="number"
                    name="duration"
                    defaultValue={session.duration}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Players
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-2 py-1 rounded-md">
                      {selectedPlayers.length} selected
                    </span>
                    {players && players.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPlayers(
                            selectedPlayers.length === players.length
                              ? []
                              : players.map((p) => p.id),
                          )
                        }
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                      >
                        {selectedPlayers.length === players.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-secondary/30 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {players && players.length > 0 ? (
                      players.map((player) => {
                        const isSelected = selectedPlayers.includes(player.id);
                        return (
                          <button
                            type="button"
                            key={player.id}
                            onClick={() => togglePlayer(player.id)}
                            className={cn(
                              "flex items-center text-left gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border",
                              isSelected
                                ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold text-xs",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card text-muted-foreground",
                              )}
                            >
                              {player.number}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span
                                className={cn(
                                  "text-sm font-semibold block truncate transition-colors",
                                  isSelected
                                    ? "text-primary"
                                    : "text-foreground",
                                )}
                              >
                                {player.name}
                              </span>
                              <span className="text-xs text-muted-foreground block truncate mt-0.5">
                                {player.position}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-white/20 bg-transparent",
                              )}
                            >
                              {isSelected && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-primary-foreground"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                        No players in your squad yet. Add players first.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-white/10 transition-colors"
                  >
                    {t("btn_cancel")}
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

function BiomechanicsUploadModal({
  open,
  onOpenChange,
  pendingSessionData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pendingSessionData?: any;
  onSuccess?: () => void;
}) {
  const createSessionMutation = useCreateSession();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [yoloSize, setYoloSize] = useState("m");
  const [playerId, setPlayerId] = useState(1);
  const [height, setHeight] = useState(1.75);
  const [mass, setMass] = useState(75);
  const [deepPipeline, setDeepPipeline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "video/mp4") setFile(dropped);
  }, []);

  const handleClose = () => {
    onOpenChange(false);
    // reset after animation
    setTimeout(() => {
      setStatus("idle");
      setErrorMsg("");
      setJobId(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    setJobId(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("player_id", String(playerId));
    formData.append("yolo_size", yoloSize);
    formData.append("player_height", String(height));
    formData.append("mass_kg", String(mass));
    if (deepPipeline) formData.append("run_sports2d", "true");

    try {
      if (pendingSessionData) {
        await createSessionMutation.mutateAsync({ data: pendingSessionData });
      }

      const res = await fetch(`${BIOMECHANICS_API}/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Analysis failed");
      setJobId(data.job_id);
      setStatus("success");
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[92vh] flex flex-col bg-card border border-white/10 shadow-2xl rounded-3xl z-50 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-8 pt-8 pb-5 border-b border-white/5 shrink-0 flex items-center justify-between">
            <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-primary" />
              Biomechanics Analysis
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 py-10 text-center"
                >
                  <div className="h-20 w-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Analysis Complete</h3>
                    {jobId && (
                      <p className="text-sm text-muted-foreground mt-1 font-mono">Job ID: {jobId}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-3">
                      Pose data, joint angles, and injury risk metrics are ready.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full max-w-xs">
                    {jobId && (
                      <a
                        href={`${BIOMECHANICS_API}/dashboard.html?job_id=${jobId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-accent/40 text-accent text-sm font-bold hover:bg-accent/10 transition-all"
                      >
                        Open Dashboard
                      </a>
                    )}
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-white/10 transition-all"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Drop zone */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 block">
                      Source Video (.mp4)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      id="bio-video-file"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
                        isDragging
                          ? "border-primary bg-primary/5 scale-[1.01]"
                          : file
                            ? "border-accent/50 bg-accent/5"
                            : "border-white/10 hover:border-white/25 hover:bg-white/5",
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {file ? (
                          <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2 text-center"
                          >
                            <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                              <FileVideo className="h-6 w-6 text-accent" />
                            </div>
                            <p className="font-semibold text-sm text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1 rounded border border-white/10 hover:border-destructive/30"
                            >
                              <X className="h-3 w-3" /> Remove
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-2 text-center"
                          >
                            <div className="h-12 w-12 rounded-full bg-secondary border border-white/10 flex items-center justify-center">
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              Drop video here or <span className="text-primary">browse</span>
                            </p>
                            <p className="text-xs text-muted-foreground">MP4 format only</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Subject params */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Subject ID
                      </label>
                      <input
                        type="number"
                        value={playerId}
                        min={1}
                        onChange={(e) => setPlayerId(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5" /> Height (m)
                      </label>
                      <input
                        type="number"
                        value={height}
                        step={0.01}
                        min={1}
                        max={2.5}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Weight className="h-3.5 w-3.5" /> Mass (kg)
                      </label>
                      <input
                        type="number"
                        value={mass}
                        step={1}
                        min={30}
                        max={200}
                        onChange={(e) => setMass(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground text-sm"
                      />
                    </div>
                  </div>

                  {/* Tracker precision */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5" /> Tracker Precision
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {YOLO_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setYoloSize(opt.value)}
                          className={cn(
                            "flex flex-col items-center gap-0.5 py-3 px-2 rounded-xl border text-center transition-all",
                            yoloSize === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-secondary text-muted-foreground hover:border-white/25 hover:text-foreground",
                          )}
                        >
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span className="text-[9px] opacity-60">{opt.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deep pipeline toggle */}
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div
                      onClick={() => setDeepPipeline((v) => !v)}
                      className={cn(
                        "relative h-6 w-11 rounded-full border transition-all duration-200 cursor-pointer shrink-0",
                        deepPipeline ? "bg-primary border-primary" : "bg-secondary border-white/10",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200",
                          deepPipeline ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        Deep Pipeline (Sports2D + OpenSim)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IK solving + marker augmentation — significantly longer
                      </p>
                    </div>
                  </label>

                  {/* Error */}
                  {status === "error" && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive font-mono break-all">{errorMsg}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={!file || status === "uploading"}
                      className={cn(
                        "px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2",
                        !file || status === "uploading"
                          ? "bg-secondary text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
                      )}
                    >
                      {status === "uploading" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        <><Zap className="h-4 w-4" /> Run Analysis</>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeleteSessionDialog({
  session,
  onSuccess,
}: {
  session: any;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteSession();
  const { t } = useI18n();

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: session.id },
      {
        onSuccess: () => {
          toast({ title: "Session deleted", variant: "primary" });
          setOpen(false);
          onSuccess();
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-card border border-white/10 shadow-2xl rounded-3xl p-8 z-50 animate-in zoom-in-95 duration-200">
          <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-3 text-destructive">
            <Trash2 className="h-6 w-6" /> Delete Session
          </Dialog.Title>
          
          <Dialog.Description className="mt-4 text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground">{session.description}</strong>? 
            This action cannot be undone and will permanently remove all associated training and movement analysis data for this session.
          </Dialog.Description>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-white/10 transition-colors"
              >
                {t("btn_cancel")}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition-all disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
