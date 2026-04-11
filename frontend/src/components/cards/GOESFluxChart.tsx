"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getGoesXrayFlux } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function GOESFluxChart() {
  const [primary, setPrimary] = useState<any[]>([]);
  const [secondary, setSecondary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGoesXrayFlux()
      .then((data) => {
        setPrimary(data.primary ?? []);
        setSecondary(data.secondary ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white/40 text-sm">Loading GOES X-Ray Data...</div>;
  if (!primary.length && !secondary.length)
    return <div className="text-white/40 text-sm">No flux data available.</div>;

  return (
    <Plot
      data={[
        {
          x: primary.map((d) => d.time_tag),
          y: primary.map((d) => d.flux),
          type: "scatter",
          mode: "lines",
          name: "GOES-16 (Primary)",
          line: { color: "#ff4500", width: 1.5 },
        },
        {
          x: secondary.map((d) => d.time_tag),
          y: secondary.map((d) => d.flux),
          type: "scatter",
          mode: "lines",
          name: "GOES-17 (Secondary)",
          line: { color: "#00bfff", width: 1.5, dash: "dot" },
        },
      ]}
      layout={{
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        title: { text: "GOES X-Ray Flux (0.1–0.8 nm)", font: { color: "#fff", size: 13 } },
        xaxis: {
          title: { text: "Time (UTC)" },
          color: "#aaa",
          showgrid: true,
          gridcolor: "#ffffff15",
        },
        yaxis: {
          title: { text: "Flux (W/m²)" },
          type: "log",
          color: "#aaa",
          showgrid: true,
          gridcolor: "#ffffff15",
        },
        legend: {
          font: { color: "#ccc", size: 11 },
          bgcolor: "transparent",
        },
        height: 280,
        margin: { t: 40, l: 60, r: 20, b: 50 },
        font: { family: "Arial", size: 11, color: "#ccc" },
      }}
      config={{ displayModeBar: false }}
      style={{ width: "100%" }}
    />
  );
}