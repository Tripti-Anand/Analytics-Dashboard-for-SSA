"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllSEPData } from "@/lib/api";
import GlassCard from "@/components/GlassCard";
import ServiceCards from "@/components/home/ServiceCards";
import { SEP_CARDS } from "@/constants/sep-cards";

interface FluxPoint {
  time_tag: string;
  flux: number;
  energy: string;
  satellite: number;
}

interface Alert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

interface RadiationRisk {
  crew: string;
  satellite: string;
  deep_space: string;
}

function riskColor(level: string): string {
  switch (level) {
    case "extreme": return "text-red-400";
    case "severe": return "text-orange-400";
    case "high": return "text-yellow-400";
    case "moderate": return "text-yellow-300";
    case "low": return "text-green-400";
    case "quiet": return "text-cyan-400";
    default: return "text-gray-400";
  }
}

function riskBg(level: string): string {
  switch (level) {
    case "extreme": return "bg-red-500/20 border-red-500/40";
    case "severe": return "bg-orange-500/20 border-orange-500/40";
    case "high": return "bg-yellow-500/20 border-yellow-500/40";
    case "moderate": return "bg-yellow-400/20 border-yellow-400/40";
    case "low": return "bg-green-500/20 border-green-500/40";
    case "quiet": return "bg-cyan-500/20 border-cyan-500/40";
    default: return "bg-white/10 border-white/20";
  }
}

function formatTime(tag: string): string {
  return new Date(tag).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

function StatCard({
  title,
  value,
  unit,
  sub,
  color = "text-pink-400",
  timestamp,
}: {
  title: string;
  value: string;
  unit: string;
  sub: string;
  color?: string;
  timestamp?: string;
}) {
  return (
    <GlassCard>
      <div className="p-5 sm:p-6 lg:p-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2">
          {title}
        </h3>

        <div className="flex items-baseline gap-2 flex-wrap">
          <p className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${color}`}>
            {value}
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400">
            {unit}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mt-4">{sub}</p>

        {timestamp && (
          <p className="text-[11px] sm:text-xs text-gray-600 mt-2">
            Updated: {timestamp}
          </p>
        )}
      </div>
    </GlassCard>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 mb-12 lg:mb-16">
      {[1, 2, 3].map((i) => (
        <GlassCard key={i}>
          <div className="p-5 sm:p-6 lg:p-8 animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-10 sm:h-12 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/3" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export default function SEPPage() {
  const [protonData, setProtonData] = useState<FluxPoint[]>([]);
  const [electronData, setElectronData] = useState<FluxPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [riskLevel, setRiskLevel] = useState("quiet");
  const [radiationRisk, setRadiationRisk] = useState<RadiationRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllSEPData();

      setProtonData(res.particle_flux?.proton || []);
      setElectronData(res.particle_flux?.electron || []);
      setAlerts(res.alerts?.alerts || []);
      setRiskLevel(res.alerts?.risk_level || "quiet");
      setRadiationRisk(res.radiation_risk || null);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch SEP data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const tenMevProtons = protonData.filter((p) => p.energy === ">=10 MeV");
  const latestProton = last(tenMevProtons) ?? last(protonData);
  const latestElectron = last(electronData);

  const currentProtonFlux = latestProton?.flux ?? 0;
  const currentElectronFlux = latestElectron?.flux ?? 0;

  const avgProton =
    tenMevProtons.length > 0
      ? tenMevProtons.reduce((a, b) => a + b.flux, 0) / tenMevProtons.length
      : 0;

  const sepEventActive = currentProtonFlux > 10;

  return (
    <>
      {/* Hero */}
      <section className="min-h-[60vh] sm:min-h-[70vh] lg:min-h-[90vh] flex flex-col items-center justify-center text-center gap-4 sm:gap-6 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase">
          SEP
        </h1>

        <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-xl">
          Solar Energetic Particle monitoring — real-time proton & electron flux
          from NOAA GOES satellites
        </p>

        {lastFetched && (
          <p className="text-xs text-gray-600">
            Last updated: {lastFetched.toLocaleTimeString()} · refreshes every 5 min
          </p>
        )}
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-pink-900/10 to-black">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 mb-12 lg:mb-16">
            <StatCard
              title="Proton Flux (≥10 MeV)"
              value={currentProtonFlux.toFixed(2)}
              unit="pfu"
              sub={`${sepEventActive ? "⚠️ SEP Event in progress" : "✅ Below event threshold"} · Avg: ${avgProton.toFixed(2)} pfu`}
              timestamp={latestProton ? formatTime(latestProton.time_tag) : undefined}
              color={currentProtonFlux > 10 ? "text-red-400" : "text-pink-400"}
            />

            <StatCard
              title="Electron Flux (≥2 MeV)"
              value={currentElectronFlux.toFixed(0)}
              unit="pfu"
              sub={`${currentElectronFlux > 1000 ? "⚠️ Elevated electron flux" : "Nominal electron environment"} · Satellite: ${latestElectron?.satellite ?? "—"}`}
              timestamp={latestElectron ? formatTime(latestElectron.time_tag) : undefined}
              color={currentElectronFlux > 1000 ? "text-orange-400" : "text-purple-400"}
            />

            <GlassCard>
              <div className="p-5 sm:p-6 lg:p-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-2">
                  Radiation Risk Level
                </h3>
                <p className={`text-3xl sm:text-4xl lg:text-5xl font-bold capitalize ${riskColor(riskLevel)}`}>
                  {riskLevel}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  {alerts.length > 0
                    ? `${alerts.length} active alert${alerts.length > 1 ? "s" : ""}`
                    : "No active alerts"}
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {!loading && radiationRisk && (
          <div className="max-w-7xl mx-auto mb-12 lg:mb-16">
            <h2 className="text-xs sm:text-sm text-white/40 uppercase tracking-widest mb-6">
              Radiation Risk by Mission Type
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {[
                { label: "Crew / Astronaut", key: "crew", icon: "👨‍🚀" },
                { label: "Satellite Operations", key: "satellite", icon: "🛰️" },
                { label: "Deep Space", key: "deep_space", icon: "🚀" },
              ].map(({ label, key, icon }) => {
                const level = radiationRisk[key as keyof RadiationRisk];

                return (
                  <div
                    key={key}
                    className={`rounded-2xl border p-5 sm:p-6 ${riskBg(level)}`}
                  >
                    <p className="text-white/50 text-sm mb-1">
                      {icon} {label}
                    </p>
                    <p className={`text-xl sm:text-2xl font-bold capitalize ${riskColor(level)}`}>
                      {level}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <ServiceCards cards={SEP_CARDS} />
    </>
  );
}