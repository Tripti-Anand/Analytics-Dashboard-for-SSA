"use client";

import React, { useRef, useLayoutEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { SpacePoint, sunPoints } from "./sun-data";
import { cn } from "@/lib/utils";

interface TheSunProps {
  onPointSelect: (point: SpacePoint) => void;
  activePointId: number | null;
}

export function TheSun({ onPointSelect, activePointId }: TheSunProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 1. LOAD MODEL
  const { scene } = useGLTF("/sun_model.glb");

  // 2. AUTO-SCALING & CENTERING LOGIC
  // This ensures the sun is always visible, regardless of how small/big it was in Blender
  useLayoutEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Find the largest dimension
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // If valid size, scale it to fit our desired radius (approx 6 units wide)
      if (maxDim > 0) {
        const desiredScale = 6.0 / maxDim; 
        modelRef.current.scale.setScalar(desiredScale);
      }
      
      // Center the model
      const center = new THREE.Vector3();
      box.getCenter(center);
      modelRef.current.position.sub(center.multiplyScalar(modelRef.current.scale.x));
    }
  }, [scene]);

  // 3. MATERIAL GLOW FIX
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
           const mat = mesh.material as THREE.MeshStandardMaterial;
           // Force it to glow bright orange/yellow
           mat.emissive = new THREE.Color("#ffaa00");
           mat.emissiveIntensity = 2.5; 
           mat.toneMapped = false;
        }
      }
    });
  }, [scene]);

  // 4. ANIMATION LOOP
  useFrame((state, delta) => {
    if (groupRef.current && activePointId === null) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const SUN_RADIUS = 3.0; 

  return (
    <group ref={groupRef}>
      {/* 3D MODEL CONTAINER */}
      <group ref={modelRef}>
         <primitive object={scene} />
      </group>
      
      {/* FALLBACK SPHERE (In case model fails to load visual, this red sphere will show) */}
      <mesh scale={[0.1, 0.1, 0.1]} visible={false}>
         <sphereGeometry />
         <meshBasicMaterial color="red" wireframe />
      </mesh>

      {/* CLICKABLE NAVBAR POINTS */}
      {sunPoints.map((point) => {
        const r = SUN_RADIUS;
        const x = r * Math.sin(point.target.phi) * Math.cos(point.target.theta);
        const y = r * Math.cos(point.target.phi);
        const z = r * Math.sin(point.target.phi) * Math.sin(point.target.theta);
        const pos = new THREE.Vector3(x, y, z);
        
        const isHovered = hoveredId === point.id;
        const isActive = activePointId === point.id;

        return (
          <group key={point.id} position={pos} lookAt={new THREE.Vector3(0,0,0)}>
             {/* Hitbox */}
             <mesh 
                visible={false}
                onClick={(e) => { e.stopPropagation(); onPointSelect(point); }}
                onPointerOver={() => { setHoveredId(point.id); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHoveredId(null); document.body.style.cursor = 'auto'; }}
             >
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color="red" />
             </mesh>

             {/* Visual Marker */}
             <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.08, 0.12, 32]} />
                <meshBasicMaterial 
                    color={isActive ? "cyan" : "white"} 
                    side={THREE.DoubleSide} 
                    transparent 
                    opacity={isHovered || isActive ? 1 : 0.6}
                    toneMapped={false}
                />
             </mesh>

             {/* Label */}
             <Html position={[0, 0.4, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
                <div 
                    className={cn(
                        "pointer-events-none transition-all duration-300 flex flex-col items-center",
                        isHovered || isActive ? "opacity-100 scale-110" : "opacity-70 scale-100"
                    )}
                >
                    <div className={cn(
                        "text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap px-2 py-1 rounded backdrop-blur-sm border",
                        isActive 
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]" 
                            : "bg-black/50 border-white/20 text-white"
                    )}>
                        {point.title}
                    </div>
                    <div className={cn("w-[1px] h-4 bg-white/50", isActive && "bg-cyan-500")} />
                </div>
             </Html>
          </group>
        );
      })}
    </group>
  );
}