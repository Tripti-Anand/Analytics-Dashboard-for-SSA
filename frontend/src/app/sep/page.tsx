import ServiceCards from "@/components/home/ServiceCards";
import { SEP_CARDS } from "@/constants/sep-cards";

export default function SEPPage() {
  return (
    <>
      <section className="h-[110vh] flex items-center justify-center text-center">
        <h1 className="text-7xl font-black uppercase">
          SEP
        </h1>
      </section>

      <ServiceCards cards={SEP_CARDS} />
    </>
  );
}
