"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SpacePoint } from "./sun-data";
import { X } from "lucide-react"; // Assuming you have lucide-react installed, or use any icon
import { cn } from "@/lib/utils";

interface OverlayUIProps {
  hoveredPoint: SpacePoint | null;
  activePoint: SpacePoint | null;
  onCloseModal: () => void;
  weatherStatus: "calm" | "storm";
}

export function OverlayUI({
  hoveredPoint,
  activePoint,
  onCloseModal,
  weatherStatus
}: OverlayUIProps) {

  const themeClass = weatherStatus === 'storm' ? "border-red-500/50 bg-red-950/80 text-red-100" : "border-yellow-500/50 bg-slate-900/80 text-yellow-100";

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-8 flex justify-center items-center">
      {/* --- Tooltip (Top Center) --- */}
      <AnimatePresence>
        {hoveredPoint && !activePoint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn("absolute top-10 px-6 py-3 rounded-lg backdrop-blur-md border shadow-[0_0_15px_rgba(255,165,0,0.3)] pointer-events-auto text-center", themeClass)}
          >
            <h3 className="text-lg font-bold uppercase tracking-wider">{hoveredPoint.title}</h3>
            <p className="text-sm opacity-90">{hoveredPoint.shortDesc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Floating Window Modal (Center) --- */}
      <AnimatePresence>
        {activePoint && (
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
            className={cn("relative w-full max-w-3xl h-[60vh] rounded-xl backdrop-blur-xl border-2 shadow-[0_0_50px_rgba(255,69,0,0.5)] pointer-events-auto overflow-hidden flex flex-col", themeClass)}
          >
            {/* Modal Header */}
            <div className={cn("flex justify-between items-center p-4 border-b", weatherStatus === 'storm' ? "border-red-500/30": "border-yellow-500/30")}>
                <h2 className="text-2xl font-bold tracking-widest uppercase glow-text">{activePoint.title}</h2>
                <button onClick={onCloseModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            {/* Modal Content (Placeholder for Charts) */}
            <div className="flex-1 p-6 overflow-y-auto bg-black/20">
                <p className="text-lg mb-6">{activePoint.fullDesc}</p>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* Placeholders for charts */}
                    <div className={cn("h-48 rounded-lg flex items-center justify-center border border-dashed opacity-70", themeClass)}>
                        [ Live Chart Placeholder 1 ]
                    </div>
                    <div className={cn("h-48 rounded-lg flex items-center justify-center border border-dashed opacity-70", themeClass)}>
                         [ Data Stream Placeholder ]
                    </div>
                    <div className={cn("col-span-2 h-48 rounded-lg flex items-center justify-center border border-dashed opacity-70", themeClass)}>
                         [ Historical Timeline ]
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}