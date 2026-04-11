"use client";

import GlassCard from "@/components/GlassCard";

export default function Copilot() {
  return (
    <>
      <h2 className="text-xl mb-6">Solar Copilot</h2>

      <GlassCard>
        <div className="h-64 mb-4 overflow-auto text-gray-300">
          Hello — ask about today’s solar activity.
        </div>

        <input
          placeholder="Ask something…"
          className="w-full bg-transparent border border-white/10 rounded-xl p-3 outline-none"
        />
      </GlassCard>
    </>
  );
}
