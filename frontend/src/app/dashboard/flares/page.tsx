import GlassCard from "@/components/GlassCard";

export default function Flares() {
  return (
    <>
      <h2 className="text-xl mb-6">Solar Flares</h2>

      <div className="space-y-3">
        {["M2.3 • 10:42","C4.1 • 08:10","M1.1 • Yesterday"].map((f,i)=>(
          <GlassCard key={i}>{f}</GlassCard>
        ))}
      </div>
    </>
  );
}
