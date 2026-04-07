import {
  useGetDashboardStats,
  useListPlayers,
} from "@workspace/api-client-react";
import {
  Activity,
  AlertTriangle,
  Users,
  HeartPulse,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { ErrorState } from "@/components/ui/error-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mockFatigueData = [
  { day: "Mon", fatigue: 45 },
  { day: "Tue", fatigue: 52 },
  { day: "Wed", fatigue: 68 },
  { day: "Thu", fatigue: 61 },
  { day: "Fri", fatigue: 75 },
  { day: "Sat", fatigue: 82 },
  { day: "Sun", fatigue: 55 },
];

export default function Dashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
    refetch: refetchStats,
    dataUpdatedAt,
  } = useGetDashboardStats();
  const {
    data: players,
    isLoading: playersLoading,
    isError: playersError,
    error: playersErrorObj,
    refetch: refetchPlayers,
  } = useListPlayers();
  const { t } = useI18n();

  const highRiskPlayers = players?.filter((p) => p.injuryRisk === "high") || [];
  const highRiskCount = stats?.highRiskPlayers || 0;

  // Handle errors
  if (statsError || playersError) {
    return (
      <div className="space-y-4 p-6">
        {statsError && (
          <ErrorState
            error={statsErrorObj}
            title="Failed to load dashboard statistics"
            onRetry={refetchStats}
          />
        )}
        {playersError && (
          <ErrorState
            error={playersErrorObj}
            title="Failed to load players data"
            onRetry={refetchPlayers}
          />
        )}
      </div>
    );
  }

  if (statsLoading || playersLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-primary border-muted rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("dashboard_title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("dashboard_subtitle")}</p>
        </div>
        {dataUpdatedAt > 0 && (
          <time
            dateTime={new Date(dataUpdatedAt).toISOString()}
            className="text-xs text-muted-foreground tabular-nums"
          >
            Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
          </time>
        )}
      </header>

      {/* Metric Cards — high-risk card is visually dominant when non-zero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highRiskCount > 0 ? (
          <Link href="/players?risk=high">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-destructive/8 border-l-4 border-l-destructive border border-destructive/20 p-6 rounded-xl relative overflow-hidden cursor-pointer hover:bg-destructive/12 transition-colors group"
            >
              <div className="flex justify-between items-start mb-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-sm font-medium text-destructive cursor-help border-b border-dotted border-destructive/40">
                      {t("metric_high_risk")}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-card border-border text-foreground">
                    <p>Players flagged by the AI injury risk engine based on biomechanical patterns and fatigue indicators. Click to view.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="p-2.5 rounded-xl bg-destructive/15 border border-destructive/25">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {highRiskCount}
              </span>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-destructive/80 font-medium">
                  {t("metric_requires_attention")}
                </p>
                <ArrowRight className="h-4 w-4 text-destructive/50 group-hover:text-destructive group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          </Link>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="bg-success/5 border border-success/15 p-6 rounded-xl"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("metric_high_risk")}
              </h3>
              <div className="p-2.5 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
            <span className="text-3xl font-bold text-success tracking-tight">0</span>
            <p className="text-xs text-success/70 mt-2">All players cleared</p>
          </motion.div>
        )}

        <MetricCard
          title={t("metric_active_squad")}
          value={stats?.activePlayers || 0}
          total={stats?.totalPlayers || 0}
          icon={Users}
          color="primary"
          delay={0.1}
          tooltipText="Players currently cleared for training and match selection. Excludes injured and recovering players."
          href="/players"
        />
        <MetricCard
          title={t("metric_avg_fatigue")}
          value={`${Math.round(stats?.teamFatigue || 0)}%`}
          subtitle={t("metric_fatigue_change")}
          icon={Activity}
          color="warning"
          delay={0.3}
          tooltipText="Team average fatigue index. >70% suggests reduced training intensity is recommended."
        />
        <MetricCard
          title={t("metric_avg_hr")}
          value={`${Math.round(stats?.teamAvgHeartRate || 0)} bpm`}
          subtitle={t("metric_hr_subtitle")}
          icon={HeartPulse}
          color="accent"
          delay={0.4}
          tooltipText="Average heart rate during the last tracked training session."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("chart_fatigue_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("chart_fatigue_subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockFatigueData}
                margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border p-3 rounded-lg shadow-xl">
                          <p className="text-muted-foreground text-xs font-semibold uppercase mb-1">
                            {label}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <p className="text-foreground font-bold text-sm">
                              Fatigue Index:{" "}
                              <span className="text-primary">
                                {payload[0].value}%
                              </span>
                            </p>
                          </div>
                          <p className="text-[10px] text-muted-foreground max-w-[150px] leading-tight">
                            Derived from biomechanical load and metabolic
                            recovery.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--card))", strokeWidth: 2 }}
                  activeDot={{
                    r: 5,
                    fill: "hsl(var(--primary))",
                    strokeWidth: 0,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("alert_critical_action")}
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-bold border border-destructive/25">
              {highRiskPlayers.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {highRiskPlayers.length > 0 ? (
              highRiskPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  aria-label={`View ${player.name} — ${player.position}, Fatigue ${player.wearableData?.fatigue}%`}
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold border border-border shrink-0">
                    {player.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-destructive transition-colors">
                      {player.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {player.position} • {t("label_fatigue")}:{" "}
                      {player.wearableData?.fatigue}%
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-destructive shrink-0 transition-colors" />
                </Link>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <HeartPulse className="h-10 w-10 text-success/50 mb-3" />
                <p className="text-sm">{t("alert_no_risk")}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  total,
  subtitle,
  icon: Icon,
  color,
  delay,
  tooltipText,
  href,
}: any) {
  const colors = {
    primary: "text-primary bg-primary/8 border-primary/15",
    destructive: "text-destructive bg-destructive/8 border-destructive/15",
    warning: "text-warning bg-warning/8 border-warning/15",
    accent: "text-accent bg-accent/8 border-accent/15",
  };

  const card = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{
        delay,
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={cn(
        "bg-card border border-border p-6 rounded-xl relative overflow-hidden transition-all duration-200 hover:border-muted-foreground/20 group h-full",
        href ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div className="flex justify-between items-start mb-4">
        {tooltipText ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-sm font-medium text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/30">
                {title}
              </h3>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-card border-border text-foreground">
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        )}
        <div
          className={cn(
            "p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105",
            colors[color as keyof typeof colors],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        {total !== undefined && (
          <span className="text-sm text-muted-foreground">/ {total}</span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block">{card}</Link>;
  }
  return card;
}
