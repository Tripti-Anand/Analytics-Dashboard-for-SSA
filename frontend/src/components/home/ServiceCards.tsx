"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ServiceCard } from "@/types/service-card"
import { getFlareRisk, getGoesXrayFlux, getMagnetogramImageUrl, getAIAImageUrl } from "@/lib/api"
import GOESFluxChart from "@/components/cards/GOESFluxChart"
import {
  CMEVelocityContent,
  CMEMagneticContent,
  CMEImpactContent,
  CMEImageContent,
  CMEEventLog,
} from "@/components/cards/CMECards"
import FlareEventLog from "@/components/cards/FlareEventLog"

// AIA wavelength → NASA image URL mapping
// REPLACE the AIA_URLS map with this
const AIA_URLS: Record<string, string> = {
  "94Å":  `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0094`,
  "131Å": `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0131`,
  "171Å": `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0171`,
  "193Å": `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0193`,
}

// ─── Card 01: Magnetogram ────────────────────────────────────────────────────
function MagnetogramContent() {
  const [risk, setRisk] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFlareRisk()
      .then(setRisk)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="grid grid-cols-2 gap-12 items-center w-full h-full mt-6">
      {/* LEFT: flare risk probabilities */}
      <div className="flex flex-col justify-center space-y-4">
        {loading && <p className="text-white/40 text-sm">Loading flare risk...</p>}
        {risk && (
          <>
            <p className="text-zinc-300 text-lg leading-relaxed">
              Magnetograms reveal solar magnetic field structures.
            </p>
            <div className="space-y-2 mt-2">
              <p className="text-sm text-white/50 uppercase tracking-widest">Flare Probability</p>
              <div className="flex gap-4">
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm">
                  C: {risk.flare_probability.C_class}%
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm">
                  M: {risk.flare_probability.M_class}%
                </span>
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                  X: {risk.flare_probability.X_class}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: live magnetogram image from your backend */}
      <div className="flex items-center justify-center">
        <img
          src={getMagnetogramImageUrl()}
          alt="HMI Magnetogram"
          className="w-full max-w-[300px] aspect-square object-cover rounded-2xl shadow-xl border border-white/10"
        />
      </div>
    </div>
  )
}

// ─── Card 02: GOES X-ray Flux ────────────────────────────────────────────────
function GoesFluxContent() {
  const [flux, setFlux] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGoesXrayFlux()
      .then(setFlux)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Get latest flux value to show flare class
  const latest = flux[flux.length - 1]
  const fluxValue = latest?.flux ?? null

  function getFlareClass(f: number) {
    if (f >= 1e-4) return { label: "X", color: "text-red-400" }
    if (f >= 1e-5) return { label: "M", color: "text-orange-400" }
    if (f >= 1e-6) return { label: "C", color: "text-yellow-400" }
    if (f >= 1e-7) return { label: "B", color: "text-green-400" }
    return { label: "A", color: "text-blue-400" }
  }

  const flareClass = fluxValue ? getFlareClass(fluxValue) : null

  return (
    <div className="grid grid-cols-2 gap-12 items-center w-full h-full mt-6">
      {/* LEFT: description + live class */}
      <div className="flex flex-col justify-center space-y-4">
        <p className="text-lg text-zinc-300 leading-relaxed">
          GOES satellites measure solar X-ray flux used to classify flares.
        </p>
        {loading && <p className="text-white/40 text-sm">Fetching live flux...</p>}
        {flareClass && (
          <div className="space-y-1">
            <p className="text-sm text-white/50 uppercase tracking-widest">Current Class</p>
            <p className={`text-5xl font-black ${flareClass.color}`}>
              {flareClass.label}
            </p>
            <p className="text-white/40 text-xs">
              Flux: {fluxValue?.toExponential(2)} W/m²
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: replace the static image with the live chart */}
      <div className="flex items-center justify-center w-full">
        <GOESFluxChart />
      </div>
    </div>
  )
}

// ─── Card 03: AIA EUV Viewer ─────────────────────────────────────────────────
function AIAContent({ options }: { options: string[] }) {
  const [selected, setSelected] = useState(options[2]) // 171Å default

  return (
    <div className="grid grid-cols-2 gap-12 items-center w-full h-full mt-6">
      {/* LEFT: description + wavelength buttons */}
      <div className="flex flex-col justify-center space-y-6">
        <p className="text-lg text-zinc-300 leading-relaxed">
          AIA observes the Sun in extreme ultraviolet wavelengths.
        </p>
        <div className="flex flex-wrap gap-3">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => setSelected(o)}
              className={`px-4 py-2 rounded-full border transition text-sm
                ${selected === o
                  ? "border-white/60 bg-white/20 text-white"
                  : "border-white/20 text-white/60 hover:bg-white/10"
                }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT — now uses your backend as proxy */}
      <div className="flex items-center justify-center">
        <img
          key={selected}             // forces re-render on wavelength change
          src={getAIAImageUrl(selected)}
          alt={`AIA ${selected}`}
          className="w-full max-w-[300px] aspect-square object-cover rounded-2xl shadow-xl border border-white/10"
        />
      </div>
    </div>
  )
}

// ─── Generic CardContent router ──────────────────────────────────────────────
function CardContent({ card }: { card: ServiceCard }) {
  // Solar Flare cards
  if (card.type === "image" && card.title === "HMI Magnetogram") return <MagnetogramContent />
  if (card.type === "chart" && card.title === "GOES X-ray Flux") return <GoesFluxContent />
  if (card.type === "options" && card.title === "AIA EUV Viewer") return <AIAContent options={card.options!} />
  if (card.title === "Recent Flare Events") return <FlareEventLog />
  
  // CME cards
  if (card.title === "CME Velocity") return <CMEVelocityContent />
  if (card.title === "Magnetic Structure") return <CMEMagneticContent />
  if (card.title === "Impact Probability") return <CMEImpactContent />
  if (card.title === "CME Coronagraph Image") return <CMEImageContent />
  if (card.title === "CME Event Log") return <CMEEventLog />

  // ─── DEFAULT FALLBACK ─────────────────────────────────────────────────────
  // For SEP, Solar Wind, or any card without a specific component
  // Shows desc on left, and image/options on right if they exist
  return (
    <div className="grid grid-cols-2 gap-12 items-center w-full h-full mt-6">

      {/* LEFT: always show description */}
      <div className="flex flex-col justify-center space-y-4">
        <p className="text-lg text-zinc-300 leading-relaxed">
          {card.desc}
        </p>
      </div>

      {/* RIGHT: show image if exists, options if exists, empty otherwise */}
      <div className="flex items-center justify-center w-full h-full">

        {card.type === "image" && card.imageSrc && (
          <img
            src={card.imageSrc}
            alt={card.title}
            className="w-full max-w-[340px] rounded-2xl shadow-xl border border-white/10"
          />
        )}

        {card.type === "options" && card.options && (
          <div className="flex flex-wrap gap-3">
            {card.options.map((o) => (
              <button
                key={o}
                className="px-4 py-2 rounded-full border border-white/20 text-white/60 hover:bg-white/10 transition text-sm"
              >
                {o}
              </button>
            ))}
          </div>
        )}

        {card.type === "chart" && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/30 text-2xl">~</span>
            </div>
            <p className="text-white/30 text-sm">Live data coming soon</p>
          </div>
        )}

        {card.type === "text" && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/30 text-2xl">◎</span>
            </div>
            <p className="text-white/30 text-sm">Backend integration pending</p>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Card wrapper (unchanged from your original) ─────────────────────────────
function Card({
  card,
  index,
  total,
  progress,
}: {
  card: ServiceCard
  index: number
  total: number
  progress: any
}) {
  const start = index / total
  const end = (index + 1) / total
  const scale = useTransform(progress, [start, end], [1, 0.9])

  return (
    <div className="h-screen sticky top-0 flex items-center justify-center">
      <motion.div
        style={{ scale, zIndex: total - index }}
        className={`
          relative w-[82%] h-[65vh] rounded-[2.5rem]
          border ${card.border} p-14 flex flex-col
          shadow-2xl backdrop-blur-xl bg-gradient-to-br ${card.color}
        `}
      >
        <span className="text-sm text-white/40 font-mono">{card.id}</span>
        <h2 className="text-5xl font-black tracking-tight text-white">{card.title}</h2>
        <CardContent card={card} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />
      </motion.div>
    </div>
  )
}

// ─── Main export (unchanged) ──────────────────────────────────────────────────
export default function ServiceCards({ cards }: { cards: ServiceCard[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <section ref={ref} className="relative" style={{ height: `${cards.length * 100}vh` }}>
      {cards.map((card, i) => (
        <Card key={card.id} card={card} index={i} total={cards.length} progress={scrollYProgress} />
      ))}
    </section>
  )
}