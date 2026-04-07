import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  AlertTriangle,
  Activity,
  Gauge,
  Zap,
  HeartPulse,
  Footprints,
  ShieldAlert,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Play,
  Loader2,
  Clock,
  FlaskConical,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const BIOMECHANICS_API =
  (import.meta.env.VITE_BIOMECHANICS_API_URL as string | undefined) ?? "";

const NGROK_HEADERS: HeadersInit = { "ngrok-skip-browser-warning": "true" };

interface AnalysisData {
  id: string;
  player_id: number;
  status: string;
  session_tags: string;
  created_at: string;
  yolo_size: string;
  video_url?: string;
  data_urls?: Record<string, string>;
  plot_urls?: Record<string, string>;
  summary?: {
    player_summary?: {
      peak_risk_score?: number;
      fall_risk_label?: string;
      fatigue_label?: string;
      injury_risk_label?: string;
      injury_risk_detail?: string;
      max_speed?: number;
      avg_speed?: number;
      estimated_energy_kcal_hr?: number;
      total_distance_m?: number;
      gait_symmetry_pct?: number;
      avg_stride_length?: number;
      avg_pelvic_rotation?: number;
      double_support_pct?: number;
    };
    frame_metrics?: FrameMetric[];
  };
  logs?: string[];
}

interface FrameMetric {
  timestamp: number;
  speed?: number;
  risk_score?: number;
  left_knee_angle?: number;
  right_knee_angle?: number;
  l_valgus_clinical?: number;
  r_valgus_clinical?: number;
  trunk_lean?: number;
  [key: string]: number | undefined;
}

interface HistoryItem {
  id: string;
  session_tags: string;
  created_at: string;
  status: string;
  summary?: { player_summary?: { peak_risk_score?: number } };
}

function riskColor(label?: string) {
  if (!label) return "text-muted-foreground";
  const l = label.toLowerCase();
  if (l === "high") return "text-destructive";
  if (l === "medium") return "text-warning";
  return "text-accent";
}

function riskBg(label?: string) {
  if (!label) return "bg-muted/20";
  const l = label.toLowerCase();
  if (l === "high") return "bg-destructive/10 border-destructive/20";
  if (l === "medium") return "bg-warning/10 border-warning/20";
  return "bg-accent/10 border-accent/20";
}

export default function BiomechanicsResults() {
  const { jobId } = useParams<{ jobId: string }>();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalysis = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BIOMECHANICS_API}/analyses/${id}`, { headers: NGROK_HEADERS });
      if (!res.ok) throw new Error("Failed to load analysis");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${BIOMECHANICS_API}/analyses?limit=20`, { headers: NGROK_HEADERS });
      if (res.ok) setHistory(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (jobId) fetchAnalysis(jobId);
    fetchHistory();
  }, [jobId, fetchAnalysis, fetchHistory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading analysis data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error || "Analysis not found"}</p>
        <button onClick={() => jobId && fetchAnalysis(jobId)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-semibold hover:bg-white/10 transition-all">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const ps = data.summary?.player_summary;
  const frames = data.summary?.frame_metrics || [];
  // Downsample frames for chart perf (max 200 points)
  const chartFrames = frames.length > 200
    ? frames.filter((_, i) => i % Math.ceil(frames.length / 200) === 0)
    : frames;

  // Compute gait biometrics from frame_metrics (matching engineer's dashboard.js logic)
  const avgFromFrames = (key: string) => {
    const vals = frames
      .map((m) => m[key] ?? m[`bio_${key}`])
      .filter((v): v is number => v !== undefined && !isNaN(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
  };
  const computedStepWidth = ps?.avg_stride_length != null ? ps.avg_stride_length * 0.12 : undefined;
  const computedTrunkLean = avgFromFrames("trunk_lean");
  const computedTrunkSagittal = avgFromFrames("bio_trunk_sagittal_lean");
  const computedArmSwing = avgFromFrames("bio_left_arm_swing");

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header>
        <Link href="/sessions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-2">
          <ChevronLeft className="h-4 w-4" /> Back to Sessions
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-primary" /> Biomechanics Report
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {data.session_tags} — Player #{data.player_id} — {new Date(data.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("px-3 py-1 rounded-lg text-xs font-bold uppercase border", data.status === "success" ? "bg-accent/10 text-accent border-accent/20" : "bg-warning/10 text-warning border-warning/20")}>
              {data.status}
            </span>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      {ps && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Peak Risk", value: ps.peak_risk_score?.toFixed(0) ?? "—", unit: "/100", icon: ShieldAlert, color: riskColor(ps.fall_risk_label), bg: riskBg(ps.fall_risk_label), sub: ps.fall_risk_label },
            { label: "Max Speed", value: ps.max_speed?.toFixed(1) ?? "—", unit: "m/s", icon: Zap, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { label: "Energy Burn", value: ps.estimated_energy_kcal_hr?.toFixed(0) ?? "—", unit: "kcal/hr", icon: HeartPulse, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
            { label: "Fatigue", value: ps.fatigue_label ?? "—", unit: "", icon: Activity, color: riskColor(ps.fatigue_label), bg: riskBg(ps.fatigue_label) },
            { label: "Gait Symmetry", value: ps.gait_symmetry_pct?.toFixed(1) ?? "—", unit: "%", icon: Footprints, color: "text-accent", bg: "bg-accent/10 border-accent/20" },
            { label: "Injury Risk", value: ps.injury_risk_label ?? "—", unit: "", icon: AlertTriangle, color: riskColor(ps.injury_risk_label), bg: riskBg(ps.injury_risk_label), sub: ps.injury_risk_detail },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn("p-5 rounded-xl border flex flex-col gap-3", kpi.bg)}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
              <div>
                <span className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</span>
                {kpi.unit && <span className="text-xs text-muted-foreground ml-1">{kpi.unit}</span>}
              </div>
              {kpi.sub && <p className="text-[10px] text-muted-foreground truncate">{kpi.sub}</p>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Gait Biometrics */}
      {ps && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Gait Biometrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Step Width", value: computedStepWidth, unit: "m", fmt: 2 },
              { label: "Trunk Lean", value: computedTrunkLean != null ? Math.abs(computedTrunkLean) : undefined, unit: "\u00B0", fmt: 1 },
              { label: "Double Support", value: ps.double_support_pct, unit: "%", fmt: 1 },
              { label: "Pelvic Rotation", value: ps.avg_pelvic_rotation != null ? Math.abs(ps.avg_pelvic_rotation) : undefined, unit: "\u00B0", fmt: 1 },
              { label: "Trunk Sagittal", value: computedTrunkSagittal != null ? Math.abs(computedTrunkSagittal) : undefined, unit: "\u00B0", fmt: 1 },
              { label: "Arm Swing", value: computedArmSwing, unit: "\u00B0", fmt: 1 },
            ].map((g) => (
              <div key={g.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{g.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {g.value != null ? g.value.toFixed(g.fmt) : "—"}
                  <span className="text-xs text-muted-foreground ml-0.5">{g.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {chartFrames.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Time-Series Analysis</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed */}
            <ChartCard title="Speed & Acceleration">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartFrames}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(1)}s`} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <RechartsTooltip contentStyle={{ background: "#141e30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="speed" stroke="hsl(193, 99%, 49%)" strokeWidth={2} dot={false} name="Speed (m/s)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Risk */}
            <ChartCard title="Overall Risk Trends">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartFrames}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(1)}s`} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                  <RechartsTooltip contentStyle={{ background: "#141e30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="risk_score" stroke="hsl(346, 80%, 58%)" strokeWidth={2} dot={false} name="Risk Score" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Knee Flexion */}
            <ChartCard title="Knee Flexion Range of Motion">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartFrames}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(1)}s`} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <RechartsTooltip contentStyle={{ background: "#141e30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="left_knee_angle" stroke="hsl(193, 99%, 49%)" strokeWidth={2} dot={false} name="Left Knee" />
                  <Line type="monotone" dataKey="right_knee_angle" stroke="hsl(152, 55%, 48%)" strokeWidth={2} dot={false} name="Right Knee" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Valgus */}
            <ChartCard title="Clinical Valgus (Knee Collapse)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartFrames}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(1)}s`} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <RechartsTooltip contentStyle={{ background: "#141e30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="l_valgus_clinical" stroke="hsl(38, 85%, 50%)" strokeWidth={2} dot={false} name="Left Valgus" />
                  <Line type="monotone" dataKey="r_valgus_clinical" stroke="hsl(346, 80%, 58%)" strokeWidth={2} dot={false} name="Right Valgus" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Trunk Lean - full width */}
            <div className="lg:col-span-2">
              <ChartCard title="Trunk Lean & Posture">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartFrames}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v.toFixed(1)}s`} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <RechartsTooltip contentStyle={{ background: "#141e30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="trunk_lean" stroke="hsl(193, 99%, 49%)" strokeWidth={2} dot={false} name="Trunk Lean (\u00B0)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {data.video_url && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Annotated Video</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
                <Play className="h-3 w-3 text-accent" />
                <span className="text-xs font-bold tracking-widest text-white/80">POSE ANNOTATIONS</span>
              </div>
              <video controls className="w-full aspect-video bg-black" poster="">
                <source src={data.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Downloads + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Downloads */}
        {data.data_urls && Object.keys(data.data_urls).length > 0 && (
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Raw Data Files</h2>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {Object.entries(data.data_urls).map(([name, url]) => {
                const ext = name.split(".").pop()?.toUpperCase() ?? "";
                const Icon = ext === "JSON" ? FileJson : ext === "CSV" ? FileSpreadsheet : FileText;
                return (
                  <a key={name} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{ext}</p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>

            {/* Plot images */}
            {data.plot_urls && Object.keys(data.plot_urls).length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Analytical Plots</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(data.plot_urls).map(([name, url]) => (
                    <a key={name} href={url} target="_blank" rel="noreferrer"
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
                      <img src={url} alt={name} className="w-full aspect-video object-cover bg-black" loading="lazy" />
                      <p className="px-3 py-2 text-[10px] text-muted-foreground truncate group-hover:text-foreground transition-colors">{name}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Analysis History</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border max-h-[500px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No analyses found</div>
            ) : history.map((item) => (
              <Link key={item.id} href={`/biomechanics/${item.id}`}
                className={cn("flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors",
                  item.id === jobId && "bg-primary/5 border-l-2 border-l-primary")}>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", item.id === jobId ? "text-primary" : "text-foreground")}>{item.session_tags || "Untitled"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase border",
                  item.status === "success" ? "text-accent border-accent/20 bg-accent/10" : "text-warning border-warning/20 bg-warning/10")}>
                  {item.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-secondary/20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-primary" /> {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
