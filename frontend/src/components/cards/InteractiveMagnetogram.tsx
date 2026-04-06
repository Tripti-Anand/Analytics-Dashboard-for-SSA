"use client"

import { useEffect, useRef, useState } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Flare {
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

interface HoverInfo {
  value: number
  screenX: number
  screenY: number
  dataX: number
  dataY: number
}

interface ClickInfo {
  region: Region | null
  x: number
  y: number
}

export default function InteractiveMagnetogram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [magnetogramData, setMagnetogramData] = useState<number[][] | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [clicked, setClicked] = useState<ClickInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/space-weather/magnetogram/latest`).then(r => r.json()),
      fetch(`${BASE_URL}/space-weather/magnetogram/regions`).then(r => r.json()),
    ])
      .then(([magResult, regResult]) => {
        setMagnetogramData(magResult.result.data)
        setRegions(regResult.regions ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Draw canvas ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!magnetogramData || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rows = magnetogramData.length
    const cols = magnetogramData[0].length
    canvas.width = cols
    canvas.height = rows

    const imageData = ctx.createImageData(cols, rows)
    const cx = cols / 2
    const cy = rows / 2
    const radius = Math.min(cx, cy) * 0.95

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) * 4
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if (dist > radius) {
          imageData.data[idx] = 0
          imageData.data[idx + 1] = 0
          imageData.data[idx + 2] = 0
          imageData.data[idx + 3] = 255
        } else {
          const val = magnetogramData[y][x]
          const normalized = Math.max(0, Math.min(255,
            Math.floor(((val + 150) / 300) * 255)
          ))
          imageData.data[idx] = normalized
          imageData.data[idx + 1] = normalized
          imageData.data[idx + 2] = normalized
          imageData.data[idx + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Draw region bounding boxes
    regions.forEach((region) => {
      const [x1, y1, x2, y2] = region.bbox
      ctx.strokeStyle = "rgba(255, 200, 0, 0.9)"
      ctx.lineWidth = 2
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
      ctx.fillStyle = "rgba(255, 200, 0, 1)"
      ctx.font = "bold 11px monospace"
      ctx.fillText(`AR${region.id}`, x1 + 2, y1 - 3)
    })

  }, [magnetogramData, regions])

  // ── Mouse handlers ──────────────────────────────────────────────────────────
  function getCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas || !magnetogramData) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const dataX = Math.floor((e.clientX - rect.left) * scaleX)
    const dataY = Math.floor((e.clientY - rect.top) * scaleY)
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    return { dataX, dataY, screenX, screenY }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const coords = getCoords(e)
    if (!coords || !magnetogramData) return
    const { dataX, dataY, screenX, screenY } = coords
    if (
      dataY >= 0 && dataY < magnetogramData.length &&
      dataX >= 0 && dataX < magnetogramData[0].length
    ) {
      setHover({
        value: magnetogramData[dataY][dataX],
        screenX,
        screenY,
        dataX,
        dataY,
      })
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const coords = getCoords(e)
    if (!coords) return
    const { dataX, dataY } = coords
    const hit = regions.find(r => {
      const [x1, y1, x2, y2] = r.bbox
      return dataX >= x1 && dataX <= x2 && dataY >= y1 && dataY <= y2
    })
    setClicked({ region: hit ?? null, x: dataX, y: dataY })
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div 
      className="grid grid-cols-2 gap-12 items-center w-full h-full mt-6"
      suppressHydrationWarning
    >

      {/* ── LEFT: info panel ── */}
      <div className="flex flex-col justify-center space-y-4 h-full">

        {!clicked ? (
          <>
            <p className="text-zinc-300 text-base leading-relaxed">
              Magnetograms reveal solar magnetic field structures.
              Hover over the image to inspect field values.
              Click a{" "}
              <span className="text-yellow-400 font-semibold">yellow region</span>
              {" "}for flare risk.
            </p>
            {loading && (
              <p className="text-white/30 text-xs">Loading magnetogram...</p>
            )}
            {!loading && regions.length > 0 && (
              <div className="space-y-1">
                <p className="text-white/30 text-xs uppercase tracking-widest">
                  Detected
                </p>
                <p className="text-white/60 text-sm">
                  {regions.length} active region{regions.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
            {!loading && regions.length === 0 && (
              <p className="text-white/30 text-xs">No active regions detected</p>
            )}
          </>
        ) : (
          <div className="space-y-4 w-full">

            {/* Header + clear button */}
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-xs uppercase tracking-widest">
                {clicked.region
                  ? `Active Region AR${clicked.region.id}`
                  : "No Active Region"}
              </p>
              <button
                onClick={() => setClicked(null)}
                className="text-white/30 hover:text-white/60 text-xs transition"
              >
                ✕ clear
              </button>
            </div>

            {clicked.region ? (
              <>
                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-white/50 text-sm">Field strength</span>
                    <span className="text-white text-sm font-mono">
                      {clicked.region.strength} G
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-white/50 text-sm">Area</span>
                    <span className="text-white text-sm font-mono">
                      {clicked.region.area} px²
                    </span>
                  </div>
                </div>

                {/* Flare probability bars */}
                <div className="space-y-3">
                  <p className="text-white/40 text-xs uppercase tracking-widest">
                    Flare Probability
                  </p>
                  {(["C", "M", "X"] as const).map((cls) => {
                    const val = clicked.region!.flare[cls] ?? 0
                    return (
                      <div key={cls} className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-4 ${
                          cls === "X" ? "text-red-400" :
                          cls === "M" ? "text-orange-400" :
                          "text-yellow-400"
                        }`}>
                          {cls}
                        </span>
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              cls === "X" ? "bg-red-400" :
                              cls === "M" ? "bg-orange-400" :
                              "bg-yellow-400"
                            }`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="text-white/40 text-sm w-8 text-right">
                          {val}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-white/40 text-sm">
                No active region at ({clicked.x}, {clicked.y}).
                Try clicking directly on a{" "}
                <span className="text-yellow-400">yellow box</span>.
              </p>
            )}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <div style={{ position: "relative", width: "280px", height: "280px", flexShrink: 0 }}>
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseLeave={() => setHover(null)}
            style={{
              width: "280px",
              height: "280px",
              display: "block",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "crosshair",
              visibility: !magnetogramData ? "hidden" : "visible",
            }}
          />
          {hover && magnetogramData && (
            <div style={{
              position: "absolute",
              left: Math.min(hover.screenX + 14, 200),
              top: Math.min(hover.screenY + 14, 240),
              pointerEvents: "none",
              zIndex: 50,
              background: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "2px 8px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.9)",
              whiteSpace: "nowrap",
            }}>
              x:{hover.dataX} y:{hover.dataY} · {hover.value.toFixed(1)}G
            </div>
          )}
        </div>
      </div>

    </div>
  )
}