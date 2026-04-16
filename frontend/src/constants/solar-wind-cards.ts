import { ServiceCard } from "@/types/service-card";

export const SOLAR_WIND_CARDS: ServiceCard[] = [
  {
    id: "01",
    title: "Solar Wind Speed",
    type: "text",
    desc:
      "Solar wind speed represents the velocity of charged particles flowing from the Sun into interplanetary space. Variations in solar wind speed influence geomagnetic conditions and can enhance auroral activity near Earth.",
    color: "from-cyan-400/35 via-blue-500/35 to-indigo-500/35",
    border: "border-blue-400/30",
  },

  {
    id: "02",
    title: "Plasma Density",
    type: "chart",
    desc:
      "Plasma density measures the concentration of charged particles in the solar wind. Higher densities can compress Earth's magnetosphere and contribute to stronger geomagnetic disturbances.",
    color: "from-teal-400/35 via-cyan-500/35 to-blue-500/35",
    border: "border-cyan-400/30",
  },

  {
    id: "03",
    title: "Interplanetary Magnetic Field",
    type: "chart",
    desc:
      "The interplanetary magnetic field (IMF) carried by the solar wind interacts with Earth's magnetic field. A strong southward IMF component can trigger geomagnetic storms.",
    color: "from-purple-500/35 via-indigo-500/35 to-blue-500/35",
    border: "border-purple-400/30",
  },

  {
    id: "04",
    title: "Solar Wind Visualization",
    type: "image",
    imageSrc:
      "https://services.swpc.noaa.gov/images/solar-wind-speed.png",
    desc:
      "Real-time solar wind measurements from spacecraft such as DSCOVR help monitor the flow of particles from the Sun toward Earth.",
    color: "from-blue-500/35 via-cyan-500/35 to-emerald-500/35",
    border: "border-indigo-400/30",
  },
];