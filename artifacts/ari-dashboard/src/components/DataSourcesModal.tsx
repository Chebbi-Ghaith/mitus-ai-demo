import { useState, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Plug, Upload, FileText, CheckCircle2, AlertCircle, 
  RefreshCw, Wifi, WifiOff, FileUp, Loader2, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface Integration {
  id: number;
  playerId: number;
  provider: string;
  status: string;
  lastSync?: string;
  connectedAt?: string;
}

interface Document {
  id: number;
  originalName: string;
  fileType: string;
  category: string;
  status: string;
  parsedRows: number;
  notes: string;
  uploadedAt: string;
}

interface Props {
  playerId: number;
  playerName: string;
}

const WEARABLE_PROVIDERS = [
  {
    id: "whoop",
    name: "Whoop",
    logo: "⌚",
    color: "from-red-500/20 to-red-900/10 border-red-500/30",
    activeColor: "from-red-500/30 to-red-900/20 border-red-400/60",
    desc: "Strain, recovery & sleep",
  },
  {
    id: "apple_health",
    name: "Apple Health",
    logo: "🍎",
    color: "from-blue-500/20 to-blue-900/10 border-blue-500/30",
    activeColor: "from-blue-500/30 to-blue-900/20 border-blue-400/60",
    desc: "Heart rate, workouts & vitals",
  },
  {
    id: "oura",
    name: "Oura Ring",
    logo: "💍",
    color: "from-purple-500/20 to-purple-900/10 border-purple-500/30",
    activeColor: "from-purple-500/30 to-purple-900/20 border-purple-400/60",
    desc: "HRV, sleep & readiness",
  },
  {
    id: "garmin",
    name: "Garmin",
    logo: "🏃",
    color: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30",
    activeColor: "from-emerald-500/30 to-emerald-900/20 border-emerald-400/60",
    desc: "GPS, speed & performance",
  },
];

const TABS = ["wearables", "medical", "upload"] as const;
type Tab = typeof TABS[number];

export function DataSourcesModal({ playerId, playerName }: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("wearables");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<"wearable" | "medical">("wearable");
  const [lastUpload, setLastUpload] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/players/${playerId}/integrations`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations ?? []);
        setDocuments(data.documents ?? []);
      }
    } catch {}
  }, [playerId]);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v) fetchData();
  };

  const isConnected = (provider: string) =>
    integrations.find(i => i.provider === provider)?.status === "connected";

  const getLastSync = (provider: string) => {
    const intg = integrations.find(i => i.provider === provider);
    if (!intg?.lastSync) return null;
    return new Date(intg.lastSync).toLocaleString();
  };

  const toggleProvider = async (provider: string) => {
    setLoadingProvider(provider);
    const action = isConnected(provider) ? "disconnect" : "connect";
    try {
      await fetch(`${BASE}/api/players/${playerId}/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, action }),
      });
      await fetchData();
    } catch {}
    setLoadingProvider(null);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setLastUpload(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", uploadCategory);
    try {
      const res = await fetch(`${BASE}/api/players/${playerId}/upload`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const doc: Document = await res.json();
        setLastUpload(doc);
        await fetchData();
      }
    } catch {}
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-white/10 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all group">
          <Plug className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          Data Sources
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl bg-[#0B1120] border border-white/10 shadow-2xl rounded-3xl z-50 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-0 shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Plug className="h-5 w-5 text-primary" />
                  </div>
                  Data Sources
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground mt-1.5">
                  Configure data integrations for <span className="text-foreground font-semibold">{playerName}</span>
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 border-b border-white/10">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px",
                    activeTab === tab
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {tab === "wearables" ? "Wearables" : tab === "medical" ? "Medical Records" : "Upload File"}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              
              {/* WEARABLES TAB */}
              {activeTab === "wearables" && (
                <motion.div key="wearables" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <p className="text-sm text-muted-foreground mb-6">
                    Connect wearable devices to automatically sync biometric data.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {WEARABLE_PROVIDERS.map(provider => {
                      const connected = isConnected(provider.id);
                      const loading = loadingProvider === provider.id;
                      const lastSync = getLastSync(provider.id);
                      return (
                        <div
                          key={provider.id}
                          className={cn(
                            "p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300",
                            connected ? provider.activeColor : provider.color
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl leading-none">{provider.logo}</span>
                              <div>
                                <p className="font-bold text-foreground">{provider.name}</p>
                                <p className="text-xs text-muted-foreground">{provider.desc}</p>
                              </div>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                              connected ? "bg-success/20 text-success border-success/30" : "bg-white/5 text-muted-foreground border-white/10"
                            )}>
                              {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                              {connected ? "Connected" : "Off"}
                            </div>
                          </div>

                          {connected && lastSync && (
                            <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" /> Last sync: {lastSync}
                            </p>
                          )}

                          <button
                            onClick={() => toggleProvider(provider.id)}
                            disabled={loading}
                            className={cn(
                              "w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                              connected
                                ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                                : "bg-white/10 text-foreground hover:bg-white/20 border border-white/10"
                            )}
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : connected ? (
                              <><WifiOff className="h-4 w-4" /> Disconnect</>
                            ) : (
                              <><Link2 className="h-4 w-4" /> Connect</>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* MEDICAL TAB */}
              {activeTab === "medical" && (
                <motion.div key="medical" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <p className="text-sm text-muted-foreground mb-6">
                    Connect external medical record systems or manage EHR integrations.
                  </p>
                  
                  {/* EHR Providers */}
                  {[
                    { id: "medical_records", name: "Electronic Health Records (EHR)", logo: "🏥", desc: "Connect your clinic's EHR system" },
                    { id: "doctolib", name: "Doctolib", logo: "🩺", desc: "Medical appointments & records" },
                    { id: "epic", name: "Epic Systems", logo: "📋", desc: "Enterprise medical data platform" },
                  ].map(provider => {
                    const connected = isConnected(provider.id);
                    const loading = loadingProvider === provider.id;
                    return (
                      <div key={provider.id} className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/5 transition-colors mb-3">
                        <span className="text-3xl leading-none">{provider.logo}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleProvider(provider.id)}
                          disabled={loading}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0",
                            connected
                              ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                              : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                          )}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    );
                  })}

                  {/* Connected docs */}
                  {documents.filter(d => d.category === "medical").length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Uploaded Medical Files</p>
                      {documents.filter(d => d.category === "medical").map(doc => (
                        <DocRow key={doc.id} doc={doc} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* UPLOAD TAB */}
              {activeTab === "upload" && (
                <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <p className="text-sm text-muted-foreground mb-5">
                    Upload CSV, JSON or PDF files. Data will be automatically parsed and saved to the database.
                  </p>

                  {/* Category selector */}
                  <div className="flex gap-2 mb-6">
                    {(["wearable", "medical"] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setUploadCategory(cat)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize",
                          uploadCategory === cat
                            ? "bg-primary/15 text-primary border-primary/40"
                            : "bg-secondary text-muted-foreground border-white/10 hover:border-white/20"
                        )}
                      >
                        {cat === "wearable" ? "⌚ Wearable Data" : "🏥 Medical Records"}
                      </button>
                    ))}
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all",
                      dragging
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-white/20 hover:border-primary/50 hover:bg-white/3"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json,.pdf"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-sm font-semibold text-primary">Processing file...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <FileUp className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Drop your file here, or click to browse</p>
                          <p className="text-sm text-muted-foreground mt-1">Supported: CSV, JSON, PDF — up to 10MB</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {[".csv", ".json", ".pdf"].map(ext => (
                            <span key={ext} className="px-2.5 py-1 bg-secondary rounded-lg text-xs text-muted-foreground border border-white/10 font-mono">{ext}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload result */}
                  {lastUpload && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-4 p-4 rounded-2xl border flex items-start gap-3",
                        lastUpload.status === "parsed"
                          ? "bg-success/10 border-success/20"
                          : "bg-destructive/10 border-destructive/20"
                      )}
                    >
                      {lastUpload.status === "parsed" ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">{lastUpload.originalName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{lastUpload.notes}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Previous uploads */}
                  {documents.length > 0 && (
                    <div className="mt-8">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Upload History</p>
                      <div className="space-y-2">
                        {documents.slice().reverse().map(doc => (
                          <DocRow key={doc.id} doc={doc} />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DocRow({ doc }: { doc: Document }) {
  const iconMap: Record<string, string> = { csv: "📊", json: "📦", pdf: "📄" };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
      <span className="text-lg">{iconMap[doc.fileType] ?? "📁"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{doc.originalName}</p>
        <p className="text-xs text-muted-foreground">{doc.notes || `${doc.parsedRows} rows`}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border",
          doc.status === "parsed" ? "text-success border-success/30 bg-success/10" :
          doc.status === "error" ? "text-destructive border-destructive/30 bg-destructive/10" :
          "text-muted-foreground border-white/10 bg-white/5"
        )}>
          {doc.status}
        </span>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
