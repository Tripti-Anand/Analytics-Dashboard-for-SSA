"use client"

import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ServiceCard } from "@/types/service-card"
import { getGoesXrayFlux, getAIAImageUrl } from "@/lib/api"
import GOESFluxChart from "@/components/cards/GOESFluxChart"
import {
  CMEVelocityContent,
  CMEMagneticContent,
  CMEImpactContent,
  CMEImageContent,
  CMEEventLog,
} from "@/components/cards/CMECards"
import FlareEventLog from "@/components/cards/FlareEventLog"

const InteractiveMagnetogram = dynamic(
  () => import("@/components/cards/InteractiveMagnetogram"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center w-full h-full mt-4 md:mt-6">
        <div className="flex flex-col justify-center space-y-4">
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
            Magnetograms reveal solar magnetic field structures.
            Hover over the image to inspect field values.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
          <div
            style={{
              width: "min(280px, 100%)",
              aspectRatio: "1",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Loading...</p>
          </div>
          {/* Label placeholder shown during load */}
          <p className="text-white/30 text-xs font-mono tracking-widest uppercase">HMI Magnetogram</p>
        </div>
      </div>
    ),
  }
)

// AIA wavelength → NASA image URL mapping
const AIA_URLS: Record<string, string> = {
  "94Å":  `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0094`,
  "131Å": `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0131`,
  "171Å": `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0171`,
  "193Å": `${process.env.NEXT_PUBLIC_API_URL}/space-weather/aia-image?wavelength=0193`,
}

// ─── Card 01: Magnetogram ────────────────────────────────────────────────────
function MagnetogramContent() {
  return <InteractiveMagnetogram />
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center w-full h-full mt-4 md:mt-6">
      {/* LEFT: description + live class */}
      <div className="flex flex-col justify-center space-y-3 md:space-y-4">
        <p className="text-sm md:text-lg text-zinc-300 leading-relaxed">
          GOES satellites measure solar X-ray flux used to classify flares.
        </p>
        {loading && <p className="text-white/40 text-sm">Fetching live flux...</p>}
        {flareClass && (
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-white/50 uppercase tracking-widest">Current Class</p>
            <p className={`text-4xl md:text-5xl font-black ${flareClass.color}`}>
              {flareClass.label}
            </p>
            <p className="text-white/40 text-xs">
              Flux: {fluxValue?.toExponential(2)} W/m²
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: live chart
          ── FINE-TUNE THE CHART VERTICAL POSITION HERE ──────────────────────
          Change `-mt-12` below to move the chart up or down.
          More negative  (e.g. -mt-20) → moves chart further up.
          Less negative  (e.g. -mt-4)  → moves chart closer to center.
      */}
      <div className="flex items-start justify-center w-full -mt-12">
        <GOESFluxChart />
      </div>
    </div>
  )
}

// ─── Card 03: AIA EUV Viewer ─────────────────────────────────────────────────
function AIAContent({ options }: { options: string[] }) {
  const [selected, setSelected] = useState(options[2]) // 171Å default

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center w-full h-full mt-4 md:mt-6">
      {/* LEFT: description + wavelength buttons */}
      <div className="flex flex-col justify-center space-y-4 md:space-y-6">
        <p className="text-sm md:text-lg text-zinc-300 leading-relaxed">
          AIA observes the Sun in extreme ultraviolet wavelengths.
        </p>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => setSelected(o)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full border transition text-xs md:text-sm
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

      {/* RIGHT: proxy image + dynamic label */}
      <div className="flex items-start justify-center w-full -mt-8 md:-mt-16">
        <div className="scale-90 md:scale-95 flex flex-col items-center gap-2.5">
          <img
            key={selected}
            src={getAIAImageUrl(selected)}
            alt={`AIA ${selected}`}
            className="w-[220px] h-[220px] md:w-[290px] md:h-[290px] object-cover rounded-xl shadow-2xl"
          />
          {/* Dynamic label — updates with selected wavelength */}
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium tracking-wide">
              AIA {selected} Image
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              SDO · Atmospheric Imaging Assembly
            </p>
          </div>
        </div>
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

  // ─── DEFAULT FALLBACK ──────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center w-full h-full mt-4 md:mt-6">

      {/* LEFT: always show description */}
      <div className="flex flex-col justify-center space-y-4">
        <p className="text-sm md:text-lg text-zinc-300 leading-relaxed">
          {card.desc}
        </p>
      </div>

      {/* RIGHT: informational rows or image */}
      <div className="flex items-center justify-center w-full h-full">

        {card.type === "image" && card.imageSrc && (
          <img
            src={card.imageSrc}
            alt={card.title}
            className="w-full max-w-[280px] md:max-w-[340px] rounded-2xl shadow-xl border border-white/10"
          />
        )}

        {card.title === "Solar Wind Speed" && (
          <div className="flex flex-col gap-2 md:gap-4 w-full">
            {[
              { label: "Typical Range", value: "300 – 800 km/s", color: "text-cyan-300" },
              { label: "Slow Wind",     value: "< 400 km/s",     color: "text-green-300" },
              { label: "Fast Wind",     value: "> 600 km/s",     color: "text-orange-300" },
              { label: "Storm Threshold", value: "> 700 km/s",   color: "text-red-300" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center border border-white/10 rounded-xl px-3 md:px-5 py-2 md:py-3 bg-white/5">
                <span className="text-white/50 text-xs md:text-sm">{row.label}</span>
                <span className={`${row.color} font-semibold text-xs md:text-sm`}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {card.title === "Plasma Density" && (
          <div className="flex flex-col gap-2 md:gap-4 w-full">
            {[
              { label: "Typical Range", value: "1 – 20 p/cm³", color: "text-cyan-300" },
              { label: "Low Density",   value: "< 5 p/cm³",    color: "text-green-300" },
              { label: "High Density",  value: "> 10 p/cm³",   color: "text-orange-300" },
              { label: "Source",        value: "NOAA SWPC",    color: "text-blue-300" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center border border-white/10 rounded-xl px-3 md:px-5 py-2 md:py-3 bg-white/5">
                <span className="text-white/50 text-xs md:text-sm">{row.label}</span>
                <span className={`${row.color} font-semibold text-xs md:text-sm`}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {card.title === "Interplanetary Magnetic Field" && (
          <div className="flex flex-col gap-2 md:gap-4 w-full">
            {[
              { label: "Bz Northward", value: "Quiet conditions",     color: "text-green-300" },
              { label: "Bz Southward", value: "Geomagnetic activity", color: "text-orange-300" },
              { label: "Bz < −10 nT",  value: "Storm likely",         color: "text-red-300" },
              { label: "Components",   value: "Bx · By · Bz · Bt",    color: "text-purple-300" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center border border-white/10 rounded-xl px-3 md:px-5 py-2 md:py-3 bg-white/5">
                <span className="text-white/50 text-xs md:text-sm">{row.label}</span>
                <span className={`${row.color} font-semibold text-xs md:text-sm`}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
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
        style={{
          scale,
          zIndex: total - index,
        }}
        className={`
          relative w-[92%] md:w-[82%] h-[75vh] md:h-[65vh] rounded-[1.5rem] md:rounded-[2.5rem]
          border ${card.border} p-6 md:p-14 flex flex-col shadow-2xl
          bg-[#0a0a0f] overflow-hidden
        `}
      >
        {/* gradient tint */}
        <div className={`absolute inset-0 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br ${card.color} opacity-40`} />

        {/* content — overflow-hidden prevents internal scrollbars */}
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <span className="text-xs md:text-sm text-white/40 font-mono">{card.id}</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {card.title}
          </h2>
          {/* Constrain content area so it never overflows the card */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CardContent card={card} />
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />
      </motion.div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
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