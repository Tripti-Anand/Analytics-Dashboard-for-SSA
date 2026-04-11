import GlassCard from "@/components/GlassCard";

export default function SolarWind() {
  return (
    <>
      <h2 className="text-xl mb-6">Solar Wind</h2>

      <div className="grid grid-cols-3 gap-4">
        <GlassCard title="Speed">520 km/s</GlassCard>
        <GlassCard title="Density">6.1 p/cm³</GlassCard>
        <GlassCard title="IMF">-3.2 nT</GlassCard>
      </div>
    </>
  );
}
