// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// --- Card 01: HMI Magnetogram ---
export function getMagnetogramImageUrl(): string {
  // Returns a URL string directly usable in <img src={...} />
  return `${BASE_URL}/space-weather/magnetogram/image`
}

export async function getFlareRisk() {
  const res = await fetch(`${BASE_URL}/space-weather/magnetogram/flare-risk`)
  if (!res.ok) throw new Error("Flare risk fetch failed")
  return res.json()
  // Returns: { features: {...}, flare_probability: { C_class, M_class, X_class } }
}

// --- Card 02: GOES X-ray Flux ---
export async function getGoesXrayFlux() {
  const res = await fetch(`${BASE_URL}/noaa/goes-xray`)
  if (!res.ok) throw new Error("GOES fetch failed")
  return res.json()
  // Returns: [{ primary: [...], secondary: [...] }, ...]
}

// --- Card 03: Solar Flares (optional, for AIA card context) ---
export async function getSolarFlares() {
  const res = await fetch(`${BASE_URL}/space-weather/flares`)
  if (!res.ok) throw new Error("Flares fetch failed")
  return res.json()
}

// add this to lib/api.ts
export function getAIAImageUrl(wavelength: string): string {
  const codes: Record<string, string> = {
    "94Å":  "0094",
    "131Å": "0131",
    "171Å": "0171",
    "193Å": "0193",
  }
  return `${BASE_URL}/space-weather/aia-image?wavelength=${codes[wavelength]}`
}
// --- CME Data ---
export async function getCMEData() {
  const res = await fetch(`${BASE_URL}/space-weather/cme/full`)
  if (!res.ok) throw new Error("CME fetch failed")
  return res.json()
  // Returns: { status, total, cme_events: [...] }
}

export function getCMEImageUrl(): string {
  return `${BASE_URL}/space-weather/cme/image`
}