"use client";

import ServiceCards from "@/components/home/ServiceCards";
import { SOLAR_FLARE_CARDS } from "@/constants/solar-flare-cards";
import FlarePredictionCard from "@/components/cards/FlarePredictionCard";

export default function SolarFlarePage() {
  return (
    <>
      <section className="min-h-screen h-[100vh] flex items-center justify-center pt-20">
        <h1 className="text-7xl font-black uppercase">Solar Flare</h1>
      </section>

      {/* AI Prediction card */}
      <section className="px-6 py-8 max-w-md mx-auto w-full">
        <FlarePredictionCard />
      </section>

      <ServiceCards cards={SOLAR_FLARE_CARDS} />
    </>
  );
}