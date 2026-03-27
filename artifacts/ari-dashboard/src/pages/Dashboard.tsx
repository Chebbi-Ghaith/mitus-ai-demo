import { useGetDashboardStats, useListPlayers } from "@workspace/api-client-react";
import { Activity, AlertTriangle, Users, HeartPulse, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart since the backend doesn't provide historical trend yet
const mockFatigueData = [
  { day: 'Mon', fatigue: 45 },
  { day: 'Tue', fatigue: 52 },
  { day: 'Wed', fatigue: 68 },
  { day: 'Thu', fatigue: 61 },
  { day: 'Fri', fatigue: 75 },
  { day: 'Sat', fatigue: 82 },
  { day: 'Sun', fatigue: 55 },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: players, isLoading: playersLoading } = useListPlayers();

  const highRiskPlayers = players?.filter(p => p.injuryRisk === 'high') || [];

  if (statsLoading || playersLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
          <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-display font-bold">Squad Overview</h1>
        <p className="text-muted-foreground mt-1">AI performance and risk analytics for the current week.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Squad" 
          value={stats?.activePlayers || 0} 
          total={stats?.totalPlayers || 0}
          icon={Users} 
          color="primary"
          delay={0.1}
        />
        <MetricCard 
          title="High Injury Risk" 
          value={stats?.highRiskPlayers || 0} 
          subtitle="Requires attention"
          icon={AlertTriangle} 
          color="destructive"
          delay={0.2}
          isAlert={stats?.highRiskPlayers ? stats.highRiskPlayers > 0 : false}
        />
        <MetricCard 
          title="Avg Team Fatigue" 
          value={`${Math.round(stats?.teamFatigue || 0)}%`} 
          subtitle="+4% from last week"
          icon={Activity} 
          color="warning"
          delay={0.3}
        />
        <MetricCard 
          title="Avg Heart Rate" 
          value={`${Math.round(stats?.teamAvgHeartRate || 0)} bpm`} 
          subtitle="During active sessions"
          icon={HeartPulse} 
          color="accent"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Team Fatigue Trend</h3>
              <p className="text-sm text-muted-foreground">Aggregate wearable data across all sessions</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary border border-white/5 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockFatigueData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fatigue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0, className: "drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attention Needed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Critical Action
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-bold border border-destructive/30">
              {highRiskPlayers.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {highRiskPlayers.length > 0 ? (
              highRiskPlayers.map(player => (
                <div key={player.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-destructive/30 transition-colors group cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold border border-white/10 shrink-0">
                    {player.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-destructive transition-colors">{player.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{player.position} • Fatigue: {player.wearableData?.fatigue}%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <HeartPulse className="h-10 w-10 text-success/50 mb-3" />
                <p className="text-sm">No players currently at high risk. Squad is in optimal condition.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, total, subtitle, icon: Icon, color, delay, isAlert = false }: any) {
  const colors = {
    primary: "text-primary bg-primary/10 border-primary/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    accent: "text-accent bg-accent/10 border-accent/20",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "glass-panel p-6 rounded-2xl relative overflow-hidden",
        isAlert && "glow-danger border-destructive/50"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={cn("p-2.5 rounded-xl border backdrop-blur-md", colors[color as keyof typeof colors])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</span>
        {total !== undefined && <span className="text-sm text-muted-foreground">/ {total}</span>}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </motion.div>
  );
}
