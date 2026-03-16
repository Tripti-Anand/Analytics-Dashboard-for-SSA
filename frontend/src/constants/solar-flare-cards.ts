import { ServiceCard } from "@/types/service-card";

export const SOLAR_FLARE_CARDS: ServiceCard[] = [
  {
    id: "01",
    title: "AIA EUV IMAGES",
    type: "options",
    desc: "Select SDO AIA EUV wavelength channel",
    options: ["94Å", "131Å", "171Å", "193Å", "211Å", "304Å", "335Å"],
    color: "#522845",
    border: "border-white/10",
  },

  {
    id: "02",
    title: "SOLAR MAGNETOGRAM",
    type: "image",
    imageSrc:
      "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIB.jpg",
    desc: "Solar magnetic field map used to identify active regions.",
    color: "#522845",
    border: "border-white/10",
  },

  {
    id: "03",
    title: "GOES X-RAY FLUX",
    type: "chart",
    desc: "Real-time X-ray flux monitoring of solar flare intensity.",
    color: "#522845",
    border: "border-white/10",
  },
];