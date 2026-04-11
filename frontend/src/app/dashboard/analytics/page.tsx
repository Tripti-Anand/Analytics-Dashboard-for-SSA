import GlassCard from "@/components/GlassCard";

export default function Analytics() {
  return (
    <>
      <h2 className="text-xl mb-6">Analytics</h2>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard title="Solar Cycle">Rising Phase</GlassCard>
        <GlassCard title="Flare Prediction">Moderate</GlassCard>
      </div>
    </>
  );
}
