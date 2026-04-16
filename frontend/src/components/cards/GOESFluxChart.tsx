"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getGoesXrayFlux } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// SSR-safe layout effect
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function GOESFluxChart() {
  const [primary, setPrimary] = useState<any[]>([]);
  const [secondary, setSecondary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(9999); // assume large until measured
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getGoesXrayFlux()
      .then((data) => {
        setPrimary(data.primary ?? []);
        setSecondary(data.secondary ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Measure immediately on mount, then keep watching
  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Synchronously grab the initial size before first paint
    setContainerWidth(el.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isSmall = containerWidth < 500;
  const isTiny  = containerWidth < 340;

  if (loading)
    return <div className="text-white/40 text-sm">Loading GOES X-Ray Data...</div>;
  if (!primary.length && !secondary.length)
    return <div className="text-white/40 text-sm">No flux data available.</div>;

  return (
    <div ref={containerRef} style={{ width: "100%", minHeight: isSmall ? 260 : 300 }}>
      <Plot
        data={[
          {
            x: primary.map((d) => d.time_tag),
            y: primary.map((d) => d.flux),
            type: "scatter",
            mode: "lines",
            name: isTiny ? "P" : isSmall ? "Primary" : "GOES-16 (Primary)",
            line: { color: "#ff4500", width: 1.5 },
          },
          {
            x: secondary.map((d) => d.time_tag),
            y: secondary.map((d) => d.flux),
            type: "scatter",
            mode: "lines",
            name: isTiny ? "S" : isSmall ? "Secondary" : "GOES-17 (Secondary)",
            line: { color: "#00bfff", width: 1.5, dash: "dot" },
          },
        ]}
        layout={{
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          autosize: true,

          title: {
            text: isSmall ? "GOES X-Ray Flux" : "GOES X-Ray Flux (0.1–0.8 nm)",
            font: { color: "#fff", size: isSmall ? 11 : 13 },
            // Push title down slightly so it doesn't clip
            pad: { t: 4 },
          },

          xaxis: {
            title: isSmall ? undefined : { text: "Time (UTC)", font: { size: 11 } },
            color: "#aaa",
            showgrid: true,
            gridcolor: "#ffffff15",
            tickfont: { size: isSmall ? 8 : 10 },
            // Angle ticks on small screens to prevent overlap
            tickangle: isSmall ? -45 : 0,
            nticks: isSmall ? 5 : 8,
          },

          yaxis: {
            // Hide rotated label on small screens — it eats ~30px and clips
            title: isSmall
              ? undefined
              : { text: "Flux (W/m²)", font: { size: 11 } },
            type: "log",
            color: "#aaa",
            showgrid: true,
            gridcolor: "#ffffff15",
            tickfont: { size: isSmall ? 8 : 10 },
            // Use SI-prefix notation (350n, 400n) to keep ticks short
            tickformat: isSmall ? ".2s" : undefined,
          },

          // Always horizontal legend below the chart — avoids overlap on all sizes
          legend: {
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: -0.22,
            yanchor: "top",
            font: { color: "#ccc", size: isSmall ? 9 : 11 },
            bgcolor: "transparent",
          },

          // Tight margins: left keeps y-tick room, bottom keeps legend room
          margin: isSmall
            ? { t: 36, l: 42, r: 8,  b: 60 }
            : { t: 40, l: 60, r: 20, b: 70 },

          font: { family: "Arial", size: 11, color: "#ccc" },
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}