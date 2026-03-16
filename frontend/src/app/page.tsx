import ServiceCards from "@/components/home/ServiceCards";
import { SOLAR_FLARE_CARDS } from "@/constants/solar-flare-cards";

export default function Home() {
  return (
    <>
      <section className="h-[110vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-7xl md:text-[12rem] font-black tracking-[-0.05em] leading-none uppercase">
          STELAR
        </h1>

        <p className="text-white/40 mt-6 text-xl md:text-2xl font-light max-w-2xl">
          Modular, Scalable, and Dynamic. The future of SSA analytics starts here.
        </p>

        <div className="mt-12 animate-bounce opacity-20 text-3xl">↓</div>
      </section>

      <ServiceCards cards={SOLAR_FLARE_CARDS} />
    </>
  );
}
