import { ServiceCard } from "@/types/service-card";

export const SEP_CARDS: ServiceCard[] = [
  {
    id: "01",
    title: "PARTICLE FLUX",
    type: "chart",
    chartData: {},
    color: "#2a0a1a",
    border: "border-purple-900",
  },
  {
    id: "02",
    title: "ENERGY SPECTRUM",
    type: "text",
    desc: "Distribution of particle energy levels.",
    color: "#111111",
    border: "border-zinc-700",
  },
  {
    id: "03",
    title: "RADIATION MODE",
    type: "options",
    options: ["Crew", "Satellite", "Deep Space"],
    color: "#181818",
    border: "border-zinc-600",
  },
];
