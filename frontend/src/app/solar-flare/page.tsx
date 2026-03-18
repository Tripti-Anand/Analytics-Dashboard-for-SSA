"use client";

import ServiceCards from "@/components/home/ServiceCards";
import { SOLAR_FLARE_CARDS } from "@/constants/solar-flare-cards";

export default function SolarFlarePage() {
  return (
    <>
      <section className="h-[100vh] flex items-center justify-center">
        <h1 className="text-7xl font-black uppercase">Solar Flare</h1>
      </section>

      <ServiceCards cards={SOLAR_FLARE_CARDS} />
    </>
  );
}
