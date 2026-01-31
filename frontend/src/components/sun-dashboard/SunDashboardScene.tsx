"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TheSun } from "./TheSun";
import { OverlayUI } from "./OverlayUI";
import { SpacePoint } from "./sun-data";

export default function SunDashboardScene() {
  const [hoveredPoint, setHoveredPoint] = useState<SpacePoint | null>(null);
  const [activePoint, setActivePoint] = useState<SpacePoint | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<"calm" | "storm">("calm");

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${
        weatherStatus === 'storm' 
          ? 'bg-gradient-to-br from-red-950/50 via-black to-black' 
          : 'bg-gradient-to-br from-orange-950/30 via-black to-black'
      }`} />

      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        {/* --- LIGHTING FIX --- */}
        {/* We removed pointLights that cause shadows. 
            We use a strong ambientLight so the sun texture is lit evenly from all sides.
        */}
        <ambientLight intensity={2} color={"#ffffff"} />

        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />

        <TheSun
          weatherStatus={weatherStatus}
          onPointHover={setHoveredPoint}
          onPointClick={setActivePoint}
        />

        <OrbitControls 
          enablePan={false} 
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI - Math.PI / 4}
        />
      </Canvas>

      <OverlayUI
        hoveredPoint={hoveredPoint}
        activePoint={activePoint}
        onCloseModal={() => setActivePoint(null)}
        weatherStatus={weatherStatus}
      />
      
       <button 
        onClick={() => setWeatherStatus(s => s === 'calm' ? 'storm' : 'calm')}
        className="absolute bottom-5 left-5 z-50 text-white border border-white/20 px-3 py-1 rounded-full text-xs hover:bg-white/10 uppercase tracking-widest"
      >
        Simulate Weather: {weatherStatus}
      </button>
    </div>
  );
}