import { useState } from "react";
import { Link } from "wouter";
import { useListPlayers, useCreatePlayer } from "@workspace/api-client-react";
import { Search, Plus, Filter, Activity, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { formatRiskColor, formatStatusColor, cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";

export default function Players() {
  const { data: players, isLoading } = useListPlayers();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredPlayers = players?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.position.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Squad Roster</h1>
          <p className="text-muted-foreground mt-1">Manage players, view medical records and analyze performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-white/10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-full sm:w-64 placeholder:text-muted-foreground"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-secondary border border-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          
          <CreatePlayerDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-64 glass-panel rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">No players found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Try adjusting your search filters or add a new player to the squad to start tracking performance.</p>
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
              <Link href={`/players/${player.id}`} className="block h-full">
                <div className="glass-panel p-6 rounded-3xl h-full hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  
                  {/* Status indicator line */}
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1",
                    player.status === 'injured' ? "bg-destructive" :
                    player.status === 'recovering' ? "bg-warning" : "bg-success"
                  )} />

                  <div className="flex justify-between items-start mb-6 mt-1">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-background border-2 border-white/10 flex items-center justify-center shadow-lg shadow-black/40 group-hover:border-primary/50 transition-colors">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <span className="font-display font-bold text-lg text-foreground">{player.number}</span>
                      )}
                    </div>
                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", formatStatusColor(player.status))}>
                      {player.status}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">{player.position} • {player.nationality}</p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Injury Risk</p>
                      <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-semibold border inline-block", formatRiskColor(player.injuryRisk))}>
                        {player.injuryRisk}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Fatigue</p>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        {player.wearableData?.fatigue || 0}%
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

// Add Player Dialog Component
function CreatePlayerDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const mutation = useCreatePlayer();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      data: {
        name: formData.get('name') as string,
        number: parseInt(formData.get('number') as string),
        position: formData.get('position') as string,
        age: parseInt(formData.get('age') as string),
        nationality: formData.get('nationality') as string,
        height: parseFloat(formData.get('height') as string),
        weight: parseFloat(formData.get('weight') as string),
        muscleMass: parseFloat(formData.get('muscleMass') as string),
      }
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Player</span>
        </button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg bg-card border border-white/10 shadow-2xl rounded-3xl p-8 z-50 animate-in zoom-in-95 duration-200">
          <Dialog.Title className="text-2xl font-display font-bold mb-6">Add New Player</Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <input required name="name" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Jersey Number</label>
                <input required type="number" name="number" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <input required name="position" placeholder="e.g. Forward" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <input required type="number" name="age" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                <input required name="nationality" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Height (cm)</label>
                <input required type="number" step="0.1" name="height" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Weight (kg)</label>
                <input required type="number" step="0.1" name="weight" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Muscle Mass (%)</label>
                <input required type="number" step="0.1" name="muscleMass" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
              <Dialog.Close asChild>
                <button type="button" className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? "Creating..." : "Save Player"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
