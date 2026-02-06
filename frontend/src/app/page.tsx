"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sun,
  Activity,
  Wind,
  BarChart2,
  MessageSquare,
  Home as HomeIcon,
} from "lucide-react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const spark = [
  { v: 10 },
  { v: 12 },
  { v: 14 },
  { v: 13 },
  { v: 16 },
  { v: 18 },
  { v: 20 },
];

const navItems = [
  { href: "/dashboard/overview", icon: HomeIcon },
  { href: "/dashboard/sunspots", icon: Sun },
  { href: "/dashboard/flares", icon: Activity },
  { href: "/dashboard/solarwind", icon: Wind },
  { href: "/dashboard/analytics", icon: BarChart2 },
  { href: "/dashboard/copilot", icon: MessageSquare },
];

function Card({ title, value, suffix, icon: Icon }: any) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between text-gray-400 text-sm">
        <span>{title}</span>
        <Icon className="w-4 h-4 text-amber-400" />
      </div>

      <div className="text-2xl font-semibold mt-2">
        {value} <span className="text-base text-gray-400">{suffix}</span>
      </div>

      <div className="h-10 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spark}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Page() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex">
      {/* Sidebar */}
      <aside className="glass flex flex-col items-center py-6 gap-6 text-gray-400">
        {navItems.map((item, idx) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={idx} href={item.href}>
              <Icon
                className={`w-5 h-5 transition ${
                  active ? "text-amber-400" : "hover:text-amber-400"
                }`}
              />
            </Link>
          );
        })}
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-medium">Solar Dashboard</h1>
          <span className="text-gray-400 text-sm">
            April 22, 2024 · Live Data
          </span>
          <div className="w-8 h-8 rounded-full bg-white/20" />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">
          Solar Overview
        </h2>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Solar Flux" value="145" suffix="sfu" icon={Sun} />
          <Card title="Sunspots" value="36" icon={Activity} />
          <Card title="Latest Flare" value="M2.3" suffix="Class" icon={Activity} />
          <Card title="Solar Wind" value="520" suffix="km/s" icon={Wind} />
        </div>

        {/* Sun hero */}
        <div className="glass rounded-3xl p-6 mb-6">
          <div className="h-[320px] flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_80px_rgba(245,158,11,0.6)]" />
          </div>
        </div>

        {/* Bottom charts */}
        <div className="grid grid-cols-3 gap-4">
          {["X-ray Flux", "Sunspot Trend", "Geomagnetic Index"].map((t, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-4"
            >
              <p className="text-sm text-gray-400 mb-2">{t}</p>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {i === 2 ? (
                    <BarChart data={spark}>
                      <Bar dataKey="v" fill="#f59e0b" />
                    </BarChart>
                  ) : (
                    <LineChart data={spark}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
