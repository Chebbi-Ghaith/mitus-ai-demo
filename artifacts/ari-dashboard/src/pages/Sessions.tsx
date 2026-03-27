import { useState } from "react";
import { Link } from "wouter";
import { useListSessions, useCreateSession } from "@workspace/api-client-react";
import { Plus, Video, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function Sessions() {
  const { data: sessions, isLoading } = useListSessions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("sessions_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("sessions_subtitle")}</p>
        </div>
        
        <CreateSessionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 glass-panel rounded-2xl animate-pulse" />)}
        </div>
      ) : sessions?.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <Video className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold">{t("sessions_none_title")}</h3>
          <p className="text-muted-foreground mt-2">{t("sessions_none_desc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions?.map(session => (
            <Link key={session.id} href={`/analysis`}>
              <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/40 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden">
                
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-full bg-secondary border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">
                    <Video className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{session.description}</h3>
                      <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border", 
                        session.type === 'match' ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        session.type === 'training' ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-success/10 text-success border-success/20"
                      )}>
                        {session.type === 'training' ? t("type_training") : session.type === 'match' ? t("type_match") : t("type_recovery")}
                      </span>
                      <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border", 
                        session.status === 'in-progress' ? "bg-warning/20 text-warning border-warning/30 animate-pulse" : 
                        "bg-white/5 text-muted-foreground border-white/10"
                      )}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {format(new Date(session.date), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {session.duration} mins</span>
                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {session.playerIds.length} {t("sessions_players_tracked")}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
                    {t("sessions_view_analysis")} &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSessionDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const mutation = useCreateSession();
  const { t } = useI18n();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    mutation.mutate({
      data: {
        description: formData.get('description') as string,
        type: formData.get('type') as any,
        date: new Date().toISOString(),
        duration: parseInt(formData.get('duration') as string),
        playerIds: [1,2,3],
      }
    }, {
      onSuccess: () => onOpenChange(false)
    });
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
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-card border border-white/10 shadow-2xl rounded-3xl p-8 z-50 animate-in zoom-in-95 duration-200">
          <Dialog.Title className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
            <Video className="h-6 w-6 text-primary" /> {t("dialog_new_session_title")}
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{t("field_session_title")}</label>
              <input required name="description" placeholder={t("field_session_title_placeholder")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">{t("field_type")}</label>
                <select name="type" className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground appearance-none">
                  <option value="training">{t("type_training")}</option>
                  <option value="match">{t("type_match")}</option>
                  <option value="recovery">{t("type_recovery")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">{t("field_duration")}</label>
                <input required type="number" name="duration" defaultValue={90} className="w-full px-4 py-3 rounded-xl bg-secondary border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
              <Dialog.Close asChild>
                <button type="button" className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium hover:bg-white/10 transition-colors">{t("btn_cancel")}</button>
              </Dialog.Close>
              <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                {mutation.isPending ? t("btn_starting") : t("btn_start_recording")}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
