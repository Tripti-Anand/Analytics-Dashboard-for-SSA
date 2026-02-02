"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Html, useProgress, Cloud } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import { TheSun } from "./TheSun";
import { GlassModal } from "./GlassModal";
import { SpacePoint } from "./sun-data";
import * as THREE from "three";

// --- LOADER ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-200" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="text-cyan-500 font-mono text-xs tracking-widest">
          LOADING SYSTEM... {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

// --- BACKGROUND COMPONENT (Inside 3D Scene) ---
function SpaceBackground() {
  return (
    <group>
      {/* 1. Base Space Color */}
      <color attach="background" args={['#020202']} />
      
      {/* 2. Deep Star Field */}
      <Stars radius={300} depth={60} count={8000} factor={4} saturation={0} fade speed={1} />
      
      {/* 3. Subtle Nebula Fog (Optional, adds depth) */}
      <fog attach="fog" args={['#050505', 10, 50]} /> 
    </group>
  );
}

export default function SunDashboardScene() {
  const [activePoint, setActivePoint] = useState<SpacePoint | null>(null);

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      
      {/* === 3D SCENE (Background is now INSIDE here) === */}
      <div className="absolute inset-0 z-10">
        <Canvas 
            camera={{ position: [0, 0, 16], fov: 30, near: 0.1, far: 1000 }}
            gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
        >
            {/* The Environment */}
            <SpaceBackground />
            
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffaa00" />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0055ff" />

            {/* The Sun Model */}
            <Suspense fallback={<Loader />}>
                <TheSun 
                    activePointId={activePoint?.id || null} 
                    onPointSelect={setActivePoint} 
                />
            </Suspense>

            {/* Controls */}
            <OrbitControls 
                enablePan={false}
                minDistance={8}
                maxDistance={40}
                rotateSpeed={0.5}
                enabled={!activePoint} 
                autoRotate={!activePoint}
                autoRotateSpeed={0.5}
            />
        </Canvas>
      </div>

      {/* === UI OVERLAYS (Z-Index 20+ to stay on top) === */}
      
      {/* Glass Modal */}
      <div className="relative z-30">
        <AnimatePresence>
            {activePoint && (
                <GlassModal 
                    point={activePoint} 
                    onClose={() => setActivePoint(null)} 
                />
            )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-10 z-20 pointer-events-none select-none">
          <h1 className="text-5xl font-black text-white tracking-[0.15em] uppercase opacity-90 drop-shadow-[0_0_25px_rgba(255,100,0,0.3)]">
              Helios<span className="text-cyan-500">.AI</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-[1px] bg-cyan-500/50"></div>
              <p className="text-cyan-500/70 text-xs tracking-[0.3em] uppercase">Space Situational Awareness</p>
          </div>
      </div>
      
    </div>
  );
}