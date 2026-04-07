import { useGetSessionAnalysis, useGetSession } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  BrainCircuit,
  Target,
  AlertTriangle,
  CheckCircle2,
  ScanFace,
  Activity,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ErrorState } from "@/components/ui/error-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import demoGif1 from "@assets/DEMO_of_Ariadne1_1774578714688.gif";
import demoGif2 from "@assets/Ariadne_DEMO2_1774578714691.gif";

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const sessionId = id ? parseInt(id, 10) : 1; // fallback to 1 if no ID
  const {
    data: analysisData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSessionAnalysis(sessionId);
  const { data: session } = useGetSession(sessionId, { query: { enabled: !!sessionId } });
  const [activeCam, setActiveCam] = useState(0);
  const { t } = useI18n();

  const mockAnalyses = analysisData || [
    {
      id: 1,
      movementType: "Sprint Acceleration",
      correct: false,
      riskScore: 85,
      detectedIssues: ["Asymmetric arm swing", "Low knee drive"],
      confidence: 92,
    },
    {
      id: 2,
      movementType: "Lateral Change of Direction",
      correct: true,
      riskScore: 15,
      detectedIssues: [],
      confidence: 88,
    },
    {
      id: 3,
      movementType: "Deceleration",
      correct: false,
      riskScore: 65,
      detectedIssues: ["Excessive torso lean forward"],
      confidence: 95,
    },
  ];

  if (isError) {
    return (
      <div className="h-full flex flex-col pb-4">
        <header className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <Link
              href="/sessions"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-2"
            >
              <ChevronLeft className="h-4 w-4" /> {t("analysis_back")}
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ScanFace className="w-8 h-8 text-primary" />{" "}
              {t("analysis_live_feed")}
            </h1>
          </div>
        </header>
        <ErrorState
          error={error}
          title="Failed to load analysis data"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-2"
          >
            <ChevronLeft className="h-4 w-4" /> {t("analysis_back")}
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScanFace className="w-8 h-8 text-primary" />{" "}
            {t("analysis_live_feed")}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCam(0)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeCam === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            CAM 1
          </button>
          <button
            onClick={() => setActiveCam(1)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeCam === 1
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            CAM 2
          </button>
        </div>
      </header>

      {/* Video — full width */}
      <div className="bg-card border border-border rounded-xl overflow-hidden relative flex flex-col">
        <div className="absolute top-6 left-6 z-10 flex gap-3 items-center">
          <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
          <span className="font-bold text-sm tracking-widest text-white drop-shadow-md">
            REC // AI TRACKING ACTIVE
          </span>
        </div>
        <div className="absolute top-6 right-6 z-10 font-mono text-xs text-muted-foreground bg-background/70 px-3 py-1 rounded border border-border">
          60 FPS | 4K | NODE-1
        </div>

        <div className="aspect-video bg-black relative">
          <img
            src={activeCam === 0 ? demoGif1 : demoGif2}
            alt="Live Computer Vision Tracking"
            loading="lazy"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        <div className="h-14 bg-secondary/60 border-t border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <div className="text-xs font-mono text-muted-foreground">
              <span className="text-primary">Model:</span> PoseNet_v4.2{" "}
              <span className="text-muted-foreground/50 mx-1">|</span>
              <span className="text-primary">Latency:</span> 12ms
            </div>
          </div>
          <div className="flex gap-0.5 items-end h-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/30 rounded-full"
                style={{
                  height: `${Math.random() * 100 + 20}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Session identity bar */}
      <div className="bg-secondary/40 border border-border rounded-lg px-5 py-3 flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Activity className="h-4 w-4 text-primary" />
            {session?.description ? session.description : id ? `Session #${id}` : "Unnamed Session"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {session?.date ? new Date(session.date).toLocaleDateString() : "—"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {session?.duration ? `${session.duration} mins` : "—"}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs">
            {session?.playerIds ? `${session.playerIds.length} players tracked` : "—"}
          </span>
        </div>
      </div>

      {/* Event stream — below video */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-6 border-b border-border bg-secondary/20">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />{" "}
            {t("analysis_event_stream")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("analysis_biomechanical")}
          </p>
        </div>

        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4 p-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-muted/30 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAnalyses.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="p-5 rounded-xl border border-border bg-card hover:border-muted-foreground/30 transition-all relative overflow-hidden flex flex-col min-h-[160px]"
                >
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    item.correct ? "bg-success" : "bg-destructive"
                  )} />

                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-muted-foreground font-semibold">
                      T+{12 + idx}s
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="px-2 py-0.5 rounded text-[10px] tracking-wider font-bold bg-secondary border border-border text-muted-foreground cursor-help">
                          CONF {item.confidence}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-card border-border text-foreground">
                        <p>Model confidence score (0–100%) for this movement classification.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <h4 className="font-bold text-foreground flex items-center gap-2 mb-4 text-base">
                    {item.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <Target className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span>{item.movementType}</span>
                  </h4>

                  {!item.correct && (
                    <div className="space-y-4 mt-auto">
                      <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-muted-foreground font-medium uppercase tracking-wider">
                            {t("analysis_injury_risk")}
                          </span>
                          <span className="font-bold text-destructive">
                            {item.riskScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-destructive h-full rounded-full"
                            style={{ width: `${item.riskScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border pb-1.5">
                          {t("analysis_detected_issues")}
                        </p>
                        <ul className="text-xs space-y-1.5 pt-1">
                          {item.detectedIssues.map((issue, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-foreground/80 font-medium"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-px" />
                              <span className="leading-tight">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
