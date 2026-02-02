"use client";

import { motion } from "framer-motion";
import { SpacePoint } from "./sun-data";
import { X, Activity, Globe, Zap } from "lucide-react"; // Ensure lucide-react is installed

interface GlassModalProps {
  point: SpacePoint;
  onClose: () => void;
}

export function GlassModal({ point, onClose }: GlassModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop (Darken the background) */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
        />

        {/* The Glass Window */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)] overflow-hidden text-white"
        >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                <div>
                    <h2 className="text-2xl font-bold tracking-[0.2em] text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                        {point.title}
                    </h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{point.category}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 text-gray-300" />
                </button>
            </div>

            {/* Content Body */}
            <div className="p-8">
                <p className="text-gray-200 leading-relaxed text-lg mb-8">
                    {point.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {point.stats.map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                            <span className="text-gray-400 text-xs uppercase tracking-wider mb-2">{stat.label}</span>
                            <span className="text-xl font-mono font-bold text-white">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Mock Graph / Action Area */}
                <div className="h-32 rounded-xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-white/5 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 flex items-center justify-around opacity-30">
                        <Activity className="w-12 h-12" />
                        <Globe className="w-12 h-12" />
                        <Zap className="w-12 h-12" />
                     </div>
                     <span className="relative z-10 text-sm font-mono text-cyan-200">LIVE DATA STREAM INITIALIZED</span>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/20 text-center border-t border-white/5">
                <button className="text-xs text-cyan-500 hover:text-cyan-300 transition-colors uppercase tracking-widest">
                    View Full Analysis &rarr;
                </button>
            </div>
        </motion.div>
    </div>
  );
}