export type SpacePoint = {
  id: number;
  title: string; // The text shown on the sun
  category: string; // Shown in the modal
  description: string;
  stats: { label: string; value: string }[]; // Mock data for the modal
  // Spherical position on the sun
  target: { phi: number; theta: number }; 
};

export const sunPoints: SpacePoint[] = [
  {
    id: 1,
    title: "SOLAR FLARES",
    category: "X-Ray Flux Monitoring",
    description: "Real-time tracking of intense bursts of radiation coming from the release of magnetic energy associated with sunspots.",
    stats: [{ label: "Class", value: "X2.3" }, { label: "Status", value: "HIGH" }],
    target: { phi: 1.2, theta: 0.5 },
  },
  {
    id: 2,
    title: "CORONAL HOLES",
    category: "Solar Wind Source",
    description: "Regions where the sun's magnetic field opens up into interplanetary space, allowing high-speed solar wind to escape.",
    stats: [{ label: "Speed", value: "600 km/s" }, { label: "Polarity", value: "Negative" }],
    target: { phi: 0.5, theta: 2.0 },
  },
  {
    id: 3,
    title: "SUNSPOTS",
    category: "Active Regions",
    description: "Areas that appear dark on the surface of the Sun. They appear dark because they are cooler than other parts of the Sun.",
    stats: [{ label: "Count", value: "142" }, { label: "Trend", value: "Increasing" }],
    target: { phi: 2.2, theta: 3.5 },
  },
  {
    id: 4,
    title: "CME TRACKER",
    category: "Plasma Ejection",
    description: "Coronal Mass Ejections (CMEs) are large expulsions of plasma and magnetic field from the Sun's corona.",
    stats: [{ label: "ETA", value: "14h 20m" }, { label: "Impact", value: "G3 Storm" }],
    target: { phi: 1.5, theta: 5.0 },
  },
  {
    id: 5,
    title: "MAGNETOGRAM",
    category: "Magnetic Field",
    description: "Visualizing the magnetic fields on the solar photosphere. Essential for predicting flare probability.",
    stats: [{ label: "Complexity", value: "Beta-Gamma" }, { label: "Delta", value: "Stable" }],
    target: { phi: 0.2, theta: 0.0 },
  },
  {
    id: 6,
    title: "FILAMENTS",
    category: "Prominence",
    description: "Large, bright features extending outward from the Sun's surface. Anchored in the photosphere.",
    stats: [{ label: "Length", value: "200 Mm" }, { label: "Stability", value: "Low" }],
    target: { phi: 2.8, theta: -1.0 },
  },
];