import ServiceCards from "@/components/home/ServiceCards";
import { CME_CARDS } from "@/constants/cme-cards";

export default function CMEPage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="
          min-h-[55vh]
          sm:min-h-[65vh]
          md:min-h-[75vh]
          lg:min-h-[90vh]
          flex items-center justify-center
          text-center
          px-4 sm:px-6 lg:px-8
        "
      >
        <h1
          className="
            font-black uppercase tracking-tight
            text-4xl
            sm:text-5xl
            md:text-6xl
            lg:text-7xl
            xl:text-8xl
          "
        >
          CME
        </h1>
      </section>

      {/* Cards */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
        <ServiceCards cards={CME_CARDS} />
      </section>
    </>
  );
}