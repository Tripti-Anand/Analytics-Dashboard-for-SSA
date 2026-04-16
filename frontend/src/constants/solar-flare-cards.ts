import { getMagnetogramImageUrl } from "@/lib/api"
import { ServiceCard } from "@/types/service-card"

export const SOLAR_FLARE_CARDS: ServiceCard[] = [
  {
    id: "01",
    title: "HMI Magnetogram",
    type: "image",
    imageSrc: getMagnetogramImageUrl(),
    dataUrl: "/space-weather/magnetogram/flare-risk",
    desc: "Magnetograms reveal solar magnetic field structures.",
    color: "from-blue-500/35 via-indigo-500/35 to-purple-500/35",
    border: "border-blue-400/30",
  },
  {
    id: "02",
    title: "GOES X-ray Flux",
    type: "chart",
    dataUrl: "/noaa/goes-xray",
    desc: "GOES satellites measure solar X-ray flux used to classify flares.",
    color: "from-orange-500/35 via-red-500/35 to-pink-500/35",
    border: "border-red-400/30",
  },
  {
    id: "03",
    title: "AIA EUV Viewer",
    type: "options",
    options: ["94Å", "131Å", "171Å", "193Å"],
    desc: "AIA observes the Sun in extreme ultraviolet wavelengths.",
    color: "from-purple-500/35 via-violet-500/35 to-fuchsia-500/35",
    border: "border-purple-400/30",
  },
  {
    id: "04",
    title: "Recent Flare Events",
    type: "table",
    desc: "Latest solar flare events from NASA DONKI showing class, peak time, and active region.",
    color: "from-rose-500/35 via-red-500/35 to-orange-500/35",
    border: "border-rose-400/30",
  },
]