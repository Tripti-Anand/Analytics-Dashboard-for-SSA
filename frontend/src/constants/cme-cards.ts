import { ServiceCard } from "@/types/service-card";

export const CME_CARDS: ServiceCard[] = [
  {
    id: "01",
    title: "CME VELOCITY",
    type: "text",
    desc: "Measure coronal mass ejection speed through space.",
    color: "#0b1c2d",
    border: "border-blue-900",
  },
  {
    id: "02",
    title: "MAGNETIC STRUCTURE",
    type: "chart",
    chartData: {},
    color: "#111111",
    border: "border-zinc-700",
  },
  {
    id: "03",
    title: "IMPACT PROBABILITY",
    type: "options",
    options: ["Low", "Medium", "High"],
    color: "#181818",
    border: "border-zinc-600",
  },
  {
    id: "04",
    title: "CME IMAGE",
    type: "image",
    imageSrc: "/images/cme.jpg",
    color: "#050505",
    border: "border-zinc-800",
  },
];
