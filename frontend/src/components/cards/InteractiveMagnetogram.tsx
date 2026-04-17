"use client"

import { useEffect, useRef, useState } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

interface Flare {
  A: number
  B: number
  C: number
  M: number
  X: number
}

interface Region {
  id: number
  bbox: [number, number, number, number]
  strength: number
  area: number
  flare: Flare
}

export default function InteractiveMagnetogram() {
  const [regions, setRegions] = useState<Region[]>([])
  const [clicked, setClicked] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const [displaySize, setDisplaySize] = useState({ w: 240, h: 240 })

  useEffect(() => {
    fetch(`${BASE_URL}/space-weather/magnetogram/regions`)
      .then((r) => r.json())
      .then((data) => setRegions(data.regions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()

      setDisplaySize({
        w: rect.width,
        h: rect.height,
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) observer.observe(containerRef.current)

    window.addEventListener("resize", updateSize)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateSize)
    }
  }, [])

  function scaleBbox(bbox: [number, number, number, number]) {
    const [x1, y1, x2, y2] = bbox

    return {
      left: (x1 / 512) * displaySize.w,
      top: (y1 / 512) * displaySize.h,
      width: ((x2 - x1) / 512) * displaySize.w,
      height: ((y2 - y1) / 512) * displaySize.h,
    }
  }

  const flareClasses = ["A", "B", "C", "M", "X"] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-stretch w-full mt-4">

      {/* LEFT PANEL */}
      <div className="flex flex-col justify-center space-y-4 min-w-0">

        {!clicked ? (
          <>
            <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Magnetograms reveal solar magnetic field structures. Click a{" "}
              <span className="text-lime-400 font-semibold">
                highlighted region
              </span>{" "}
              on the image for flare risk.
            </p>

            {loading && (
              <p className="text-white/30 text-xs">Loading regions...</p>
            )}

            {!loading && regions.length > 0 && (
              <div className="space-y-1">
                <p className="text-white/30 text-[10px] md:text-xs uppercase tracking-widest">
                  Detected
                </p>
                <p className="text-white/60 text-xs md:text-sm">
                  {regions.length} active region
                  {regions.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest">
                Active Region AR{clicked.id}
              </p>

              <button
                onClick={() => setClicked(null)}
                className="text-white/30 hover:text-white/60 text-[10px] md:text-xs"
              >
                ✕ clear
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-white/50 text-xs md:text-sm">
                  Field strength
                </span>
                <span className="text-white text-xs md:text-sm font-mono">
                  {clicked.strength} G
                </span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-1">
                <span className="text-white/50 text-xs md:text-sm">
                  Area
                </span>
                <span className="text-white text-xs md:text-sm font-mono">
                  {clicked.area} px²
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest">
                Flare Probability
              </p>

              {flareClasses.map((cls) => {
                const val = clicked.flare[cls] ?? 0

                const color =
                  cls === "X"
                    ? { bar: "bg-red-400", text: "text-red-400" }
                    : cls === "M"
                    ? { bar: "bg-orange-400", text: "text-orange-400" }
                    : cls === "C"
                    ? { bar: "bg-yellow-400", text: "text-yellow-400" }
                    : cls === "B"
                    ? { bar: "bg-green-400", text: "text-green-400" }
                    : { bar: "bg-blue-400", text: "text-blue-400" }

                return (
                  <div key={cls} className="flex items-center gap-3">
                    <span className={`w-4 text-xs font-bold ${color.text}`}>
                      {cls}
                    </span>

                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color.bar}`}
                        style={{ width: `${val}%` }}
                      />
                    </div>

                    <span className="text-white/40 text-xs w-8 text-right">
                      {val}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col items-center justify-center w-full">

        <h2 className="text-white/70 text-xs sm:text-sm md:text-base tracking-widest uppercase mb-3 text-center">
          Solar Magnetogram
        </h2>

        {/* ✅ IMPROVED RESPONSIVE WRAPPER */}
        <div className="relative w-[85vw] sm:w-[70vw] md:w-[270px] laptop:w-[390px] desktop:w-[550px] aspect-square">

          <div ref={containerRef} className="relative w-full h-full">

            <img
              src={`${BASE_URL}/space-weather/magnetogram/image`}
              alt="HMI Magnetogram"
              className="w-full h-full object-contain rounded-full border border-white/10"
            />

            {regions.map((region) => {
              const s = scaleBbox(region.bbox)
              const isSelected = clicked?.id === region.id

              return (
                <div
                  key={region.id}
                  onClick={() => setClicked(region)}
                  style={{
                    position: "absolute",
                    left: s.left,
                    top: s.top,
                    width: s.width,
                    height: s.height,
                    border: `3px solid ${
                      isSelected
                        ? "rgba(34,197,94,1)"
                        : "rgba(163,230,53,0.95)"
                    }`,
                    borderRadius: "999px",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 0 18px rgba(34,197,94,0.55)"
                      : "0 0 12px rgba(163,230,53,0.35)",
                    transform: isSelected ? "scale(1.08)" : "scale(1)",
                    transition: "all 0.25s ease",
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -28,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: isSelected
                        ? "rgba(34,197,94,0.18)"
                        : "rgba(163,230,53,0.15)",
                      color: isSelected
                        ? "rgb(187,247,208)"
                        : "rgb(217,249,157)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    AR{region.id}
                  </span>
                </div>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  )
}