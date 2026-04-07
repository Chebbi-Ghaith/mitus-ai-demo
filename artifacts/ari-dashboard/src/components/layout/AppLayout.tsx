import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OnboardingOverlay,
  useOnboarding,
} from "@/components/OnboardingOverlay";

export function AppLayout({ children }: { children: ReactNode }) {
  const { needsOnboarding, complete: completeOnboarding, reset: replayOnboarding } = useOnboarding();

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/30 selection:text-primary">
      <Sidebar onReplayOnboarding={replayOnboarding} />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden max-h-screen overflow-y-auto relative">
        <div className="flex-1 p-6 pb-24 md:p-10 md:pb-10 z-10 w-full max-w-7xl mx-auto">
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
      <MobileNav />

      <AnimatePresence>
        {needsOnboarding && (
          <OnboardingOverlay onComplete={completeOnboarding} />
        )}
      </AnimatePresence>
    </div>
  );
}
