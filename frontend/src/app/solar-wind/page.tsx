import ServiceCards from "@/components/home/ServiceCards";
import { SOLAR_WIND_CARDS } from "@/constants/solar-wind-cards";

export default function SolarWindPage() {
  return (
    <>
      <section className="h-[110vh] flex items-center justify-center text-center">
        <h1 className="text-7xl font-black uppercase">
          Solar Wind
        </h1>
      </section>

      <ServiceCards cards={SOLAR_WIND_CARDS} />
    </>
  );
}
