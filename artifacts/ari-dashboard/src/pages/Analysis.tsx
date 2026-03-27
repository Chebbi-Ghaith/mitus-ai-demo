import { useGetSessionAnalysis } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, BrainCircuit, Target, AlertTriangle, CheckCircle2, ScanFace, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Make sure attached assets exist in these paths from the prompt context
import demoGif1 from "@assets/DEMO_of_Ariadne1_1774578714688.gif";
import demoGif2 from "@assets/Ariadne_DEMO2_1774578714691.gif";
import { useState } from "react";

export default function Analysis() {
  // Hardcoded ID 1 for demo purposes since we navigated without ID
  const { data: analysisData, isLoading } = useGetSessionAnalysis(1);
  const [activeCam, setActiveCam] = useState(0);

  const mockAnalyses = analysisData || [
    { id: 1, movementType: "Sprint Acceleration", correct: false, riskScore: 85, detectedIssues: ["Asymmetric arm swing", "Low knee drive"], confidence: 92 },
    { id: 2, movementType: "Lateral Change of Direction", correct: true, riskScore: 15, detectedIssues: [], confidence: 88 },
    { id: 3, movementType: "Deceleration", correct: false, riskScore: 65, detectedIssues: ["Excessive torso lean forward"], confidence: 95 },
  ];

  return (
    <div className="h-full flex flex-col pb-4">
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <Link href="/sessions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium mb-2">
            <ChevronLeft className="h-4 w-4" /> Back to Sessions
          </Link>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ScanFace className="w-8 h-8 text-primary" /> Live CV Feed
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveCam(0)} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeCam === 0 ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.4)]" : "bg-secondary text-muted-foreground hover:bg-white/10")}>CAM 1</button>
          <button onClick={() => setActiveCam(1)} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeCam === 1 ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.4)]" : "bg-secondary text-muted-foreground hover:bg-white/10")}>CAM 2</button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Side - Video Feed */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden relative border-white/10 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {/* Futuristic UI Overlays */}
          <div className="absolute top-6 left-6 z-10 flex gap-3 items-center">
            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse shadow-[0_0_10px_rgba(255,51,102,0.8)]" />
            <span className="font-display font-bold text-sm tracking-widest text-white drop-shadow-md">REC // AI TRACKING ACTIVE</span>
          </div>
          <div className="absolute top-6 right-6 z-10 font-mono text-xs text-primary bg-background/50 px-3 py-1 rounded backdrop-blur-sm border border-primary/30">
            60 FPS | 4K | NODE-1
          </div>
          
          {/* Target Brackets */}
          <div className="absolute inset-8 border-2 border-transparent border-t-primary/30 border-l-primary/30 rounded-tl-3xl z-10 pointer-events-none w-16 h-16" />
          <div className="absolute inset-8 border-2 border-transparent border-t-primary/30 border-r-primary/30 rounded-tr-3xl z-10 pointer-events-none w-16 h-16 right-8 left-auto" />
          <div className="absolute inset-8 border-2 border-transparent border-b-primary/30 border-l-primary/30 rounded-bl-3xl z-10 pointer-events-none w-16 h-16 bottom-8 top-auto" />
          <div className="absolute inset-8 border-2 border-transparent border-b-primary/30 border-r-primary/30 rounded-br-3xl z-10 pointer-events-none w-16 h-16 bottom-8 top-auto right-8 left-auto" />

          {/* Scanning Line */}
          <div className="absolute left-0 right-0 h-1 bg-primary/40 shadow-[0_0_15px_rgba(0,212,255,0.8)] z-10 pointer-events-none animate-scanline" />

          {/* Video Container */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            <img 
              src={activeCam === 0 ? demoGif1 : demoGif2} 
              alt="Live Computer Vision Tracking" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] pointer-events-none" />
          </div>
          
          <div className="h-16 bg-secondary/80 backdrop-blur-md border-t border-white/10 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
              <div className="text-xs font-mono text-muted-foreground">
                <span className="text-primary">Model:</span> PoseNet_v4.2 <br/>
                <span className="text-primary">Latency:</span> 12ms
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1.5 bg-primary/40 rounded-full h-4 animate-pulse" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100 + 20}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Analysis Stream */}
        <div className="glass-panel rounded-3xl border-white/10 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-secondary/30">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" /> Event Stream
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Real-time biomechanical analysis</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
               <div className="space-y-4 p-2">
                 {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
               </div>
            ) : (
              mockAnalyses.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all",
                    item.correct 
                      ? "bg-success/5 border-success/20" 
                      : "bg-destructive/5 border-destructive/30 shadow-[inset_0_0_20px_rgba(255,51,102,0.05)]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-muted-foreground">T+{12 + idx}s</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-background border border-white/10">
                      CONF: {item.confidence}%
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-foreground flex items-center gap-2 mb-3">
                    {item.correct ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Target className="w-4 h-4 text-destructive" />}
                    {item.movementType}
                  </h4>

                  {!item.correct && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Injury Risk</span>
                        <span className="font-bold text-destructive">{item.riskScore}/100</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5 mb-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-warning to-destructive h-full rounded-full" style={{ width: `${item.riskScore}%` }} />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Detected Issues:</p>
                        <ul className="text-sm space-y-1">
                          {item.detectedIssues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-foreground/80">
                              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
