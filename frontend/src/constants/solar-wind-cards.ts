import { ServiceCard } from "@/types/service-card";

export const SOLAR_WIND_CARDS: ServiceCard[] = [
  {
    id: "01",
    title: "WIND SPEED",
    type: "text",
    desc: "Analyze velocity variations of the solar wind.",
    color: "#0a1a2a",
    border: "border-blue-900",
  },
  {
    id: "02",
    title: "PLASMA DENSITY",
    type: "chart",
    chartData: {},
    color: "#111111",
    border: "border-zinc-700",
  },
];
