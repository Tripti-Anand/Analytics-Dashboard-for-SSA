import GlassCard from "@/components/GlassCard";

export default function Sunspots() {
  return (
    <>
      <h2 className="text-xl mb-6">Sunspots</h2>

      <div className="grid grid-cols-3 gap-4">
        <GlassCard title="Active Regions">AR1234, AR1235</GlassCard>
        <GlassCard title="Largest Area">450 msh</GlassCard>
        <GlassCard title="Growth Rate">+12%</GlassCard>
      </div>
    </>
  );
}
