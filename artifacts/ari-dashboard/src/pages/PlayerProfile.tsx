import { useRoute } from "wouter";
import { useGetPlayer, useGetPlayerMedical, useGetPlayerProtocols } from "@workspace/api-client-react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Pill, FileText, ChevronLeft, Calendar, Dumbbell, Play, BrainCircuit } from "lucide-react";
import { Link } from "wouter";
import { formatRiskColor, formatStatusColor, cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from "@/lib/i18n";

export default function PlayerProfile() {
  const [, params] = useRoute("/players/:id");
  const id = parseInt(params?.id || "0");
  const { t } = useI18n();

  const { data: player, isLoading: loadingPlayer } = useGetPlayer(id, { query: { enabled: !!id } });
  const { data: medical, isLoading: loadingMedical } = useGetPlayerMedical(id, { query: { enabled: !!id } });
  const { data: protocols, isLoading: loadingProtocols } = useGetPlayerProtocols(id, { query: { enabled: !!id } });

  if (loadingPlayer || !player) {
    return <div className="h-full flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const hrData = Array.from({length: 20}, (_, i) => ({
    time: `${i}m`,
    hr: 110 + Math.random() * 60 + (i > 10 && i < 15 ? 40 : 0)
  }));

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <Link href="/players" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
        <ChevronLeft className="h-4 w-4" /> {t("profile_back")}
      </Link>

      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
          <div className="h-32 w-32 rounded-full bg-secondary border-4 border-white/10 flex items-center justify-center shadow-2xl shadow-black/50 shrink-0">
            {player.avatarUrl ? (
              <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              <span className="font-display font-bold text-4xl text-primary">{player.number}</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold tracking-tight">{player.name}</h1>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", formatStatusColor(player.status))}>
                {player.status}
              </span>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", formatRiskColor(player.injuryRisk))}>
                Risk: {player.injuryRisk}
              </span>
            </div>
            <p className="text-lg text-muted-foreground mb-6">{player.position} • {player.nationality} • {player.age} {t("profile_yrs")}</p>
            
            <div className="flex flex-wrap gap-8">
              <Stat label={t("profile_height")} value={`${player.height}cm`} />
              <Stat label={t("profile_weight")} value={`${player.weight}kg`} />
              <Stat label={t("profile_muscle_mass")} value={`${player.muscleMass}%`} />
              <Stat label={t("profile_max_hr")} value={`${player.wearableData.heartRateMax}bpm`} />
            </div>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="wearables" className="w-full">
        <Tabs.List className="flex border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
          {[
            { value: "wearables", label: t("tab_wearables") },
            { value: "medical", label: t("tab_medical") },
            { value: "protocols", label: t("tab_protocols") },
          ].map(tab => (
            <Tabs.Trigger 
              key={tab.value}
              value={tab.value}
              className="px-6 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors capitalize whitespace-nowrap"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {/* WEARABLES TAB */}
          <Tabs.Content value="wearables" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricBox label={t("metric_current_fatigue")} value={`${player.wearableData.fatigue}%`} icon={Activity} color="text-warning" />
              <MetricBox label={t("metric_distance_today")} value={`${player.wearableData.distance}km`} icon={Activity} color="text-primary" />
              <MetricBox label={t("metric_top_speed")} value={`${player.wearableData.speed}km/h`} icon={Activity} color="text-success" />
            </div>

            <div className="glass-panel p-6 rounded-3xl h-[400px]">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-bold">{t("chart_hr_title")}</h3>
                <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">{t("chart_hr_synced")}</span>
              </div>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={hrData}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 20', 'dataMax + 20']} stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#131B2B', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="hr" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorHr)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Tabs.Content>

          {/* MEDICAL TAB */}
          <Tabs.Content value="medical" className="outline-none">
            {loadingMedical ? <div className="h-40 animate-pulse bg-white/5 rounded-2xl" /> : medical && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> {t("medical_overview")}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-muted-foreground">{t("medical_clearance")}</span>
                        <span className={cn("font-bold", medical.clearanceStatus === 'cleared' ? 'text-success' : 'text-destructive')}>{medical.clearanceStatus.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-muted-foreground">{t("medical_blood_type")}</span>
                        <span className="font-bold text-foreground">{medical.bloodType}</span>
                      </div>
                      <div className="flex justify-between pb-3">
                        <span className="text-muted-foreground">{t("medical_last_exam")}</span>
                        <span className="font-bold text-foreground">{new Date(medical.lastExamDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Pill className="w-5 h-5 text-warning" /> {t("medical_medications")}</h3>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">{t("medical_current_meds")}</p>
                      <div className="flex flex-wrap gap-2">
                        {medical.medications.length > 0 ? medical.medications.map(m => (
                          <span key={m} className="px-3 py-1 bg-secondary rounded-full text-xs border border-white/10">{m}</span>
                        )) : <span className="text-sm text-muted-foreground">{t("medical_none_meds")}</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t("medical_allergies")}</p>
                      <div className="flex flex-wrap gap-2">
                        {medical.allergies.length > 0 ? medical.allergies.map(a => (
                          <span key={a} className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs border border-destructive/20">{a}</span>
                        )) : <span className="text-sm text-muted-foreground">{t("medical_no_allergies")}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-accent" /> {t("medical_injury_history")}</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {medical.injuries.length > 0 ? medical.injuries.map((injury, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">
                          <div className={cn("w-3 h-3 rounded-full", injury.recovered ? "bg-success" : "bg-destructive animate-pulse")} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl group-hover:border-primary/30 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-foreground text-sm">{injury.type}</h4>
                            <span className="text-xs text-muted-foreground">{new Date(injury.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{injury.notes}</p>
                          <span className={cn("text-[10px] uppercase font-bold tracking-wider", injury.recovered ? "text-success" : "text-destructive")}>
                            {injury.recovered ? t("status_recovered") : t("status_active_issue")}
                          </span>
                        </div>
                      </div>
                    )) : <p className="text-muted-foreground text-sm">{t("medical_no_injuries")}</p>}
                  </div>
                </div>
              </div>
            )}
          </Tabs.Content>

          {/* PROTOCOLS TAB */}
          <Tabs.Content value="protocols" className="outline-none">
             {loadingProtocols ? <div className="h-40 animate-pulse bg-white/5 rounded-2xl" /> : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold">{t("protocols_title")}</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5" /> {t("protocols_badge")}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {protocols?.length ? protocols.map(protocol => (
                    <div key={protocol.id} className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">{protocol.category}</span>
                          <h4 className="font-bold text-lg">{protocol.title}</h4>
                        </div>
                        <span className={cn("px-2.5 py-1 rounded-md text-[10px] uppercase font-bold", 
                          protocol.priority === 'critical' || protocol.priority === 'high' ? "bg-destructive/10 text-destructive border border-destructive/20" : 
                          "bg-secondary text-muted-foreground border border-white/5"
                        )}>{protocol.priority} {t("protocols_priority")}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 pb-4 border-b border-white/5">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {protocol.frequency}</span>
                      </div>

                      <div className="space-y-3">
                        {protocol.exercises.map((ex, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                            <div className="mt-0.5 p-1.5 bg-secondary rounded-lg"><Dumbbell className="w-4 h-4 text-accent" /></div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{ex.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{ex.sets} sets • {ex.reps} {ex.duration ? `• ${ex.duration}` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-6 py-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground text-sm font-semibold transition-all flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" /> {t("protocols_start")}
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full glass-panel p-12 text-center rounded-3xl">
                      <p className="text-muted-foreground">{t("protocols_none")}</p>
                    </div>
                  )}
                </div>
              </div>
             )}
          </Tabs.Content>

        </motion.div>
      </Tabs.Root>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/5">
      <div className={cn("p-3 rounded-xl bg-secondary border border-white/5", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase">{label}</p>
        <p className="text-2xl font-bold font-display">{value}</p>
      </div>
    </div>
  );
}
