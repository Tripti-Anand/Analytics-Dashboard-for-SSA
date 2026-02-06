"use client";

import GlassCard from "@/components/GlassCard";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const data = [{v:10},{v:12},{v:14},{v:16},{v:18},{v:20}];

export default function Overview() {
  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-6">Solar Overview</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <GlassCard title="Solar Flux">145 sfu</GlassCard>
        <GlassCard title="Sunspots">36</GlassCard>
        <GlassCard title="Latest Flare">M2.3</GlassCard>
        <GlassCard title="Solar Wind">520 km/s</GlassCard>
      </div>

      <div className="glass rounded-3xl p-6 mb-6 flex justify-center">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_80px_rgba(245,158,11,0.6)]" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["X-ray Flux","Sunspot Trend","Geomagnetic"].map((t,i)=>(
          <GlassCard key={i} title={t}>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="v" stroke="#f59e0b" dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
