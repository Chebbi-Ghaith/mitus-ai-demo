import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/30 selection:text-primary">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto relative">
        {/* Subtle top ambient light */}
        <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex-1 p-6 md:p-10 z-10 w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full flex flex-col"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
