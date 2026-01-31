export type SpacePoint = {
  id: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  // Spherical coordinates to place points around the sun
  // phi: polar angle (up/down), theta: azimuthal angle (left/right)
  position: { phi: number; theta: number }; 
};

export const sunPoints: SpacePoint[] = [
  {
    id: 1,
    title: "Solar Flare Monitor",
    shortDesc: "Real-time X-Ray flux monitoring.",
    fullDesc: "Detailed charts of GOES X-Ray flux data showing recent solar flare activity (C, M, and X class flares).",
    position: { phi: 1.5, theta: 0.5 }, // Near equator, slightly right
  },
  {
    id: 2,
    title: "Coronal Mass Ejections (CME)",
    shortDesc: "Tracking Earth-directed plasma clouds.",
    fullDesc: "Data from SOHO LASCO coronagraphs predicting arrival times and impact velocity of CMEs.",
    position: { phi: 0.8, theta: 2.0 }, // North hemisphere, back-left
  },
  {
    id: 3,
    title: "Geomagnetic Storms (Kp)",
    shortDesc: "Planetary K-index status.",
    fullDesc: "Current and forecasted Kp index indicating disturbances in Earth's magnetic field.",
    position: { phi: 2.2, theta: 3.5 }, // South hemisphere, back-right
  },
  {
    id: 4,
    title: "Solar Wind & Plasma",
    shortDesc: "Speed, density, and temperature.",
    fullDesc: "Real-time data from DSCOVR satellite at L1 point measuring solar wind parameters.",
    position: { phi: 1.5, theta: 5.0 }, // Near equator, far right
  },
  {
    id: 5,
    title: "Sunspot Regions (Active)",
    shortDesc: "Magnetic complexity analysis.",
    fullDesc: "Images and magnetograms of currently active sunspot regions with high flare potential.",
    position: { phi: 0.5, theta: 1.0 }, // Near North pole
  },
  {
    id: 6,
    title: "Radiation Storms (Protons)",
    shortDesc: "Energetic particle flux levels.",
    fullDesc: "Monitoring levels of high-energy protons that pose risks to satellites and astronauts.",
    position: { phi: 2.5, theta: -0.5 }, // Near South pole
  },
];