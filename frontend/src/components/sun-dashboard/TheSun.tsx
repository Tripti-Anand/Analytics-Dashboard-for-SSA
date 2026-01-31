"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { SpacePoint, sunPoints } from "./sun-data";

interface TheSunProps {
  weatherStatus: "calm" | "storm";
  onPointHover: (point: SpacePoint | null) => void;
  onPointClick: (point: SpacePoint) => void;
}

export function TheSun({ weatherStatus, onPointHover, onPointClick }: TheSunProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHoveringRef = useRef(false);

  // Load YOUR specific image from the public folder
  const sunTexture = useTexture("/sun_texture.jpg");

  // Colors based on weather (Tinting the texture)
  const config = useMemo(() => {
    return weatherStatus === "storm"
      ? { color: "#ff8888", emissiveIntensity: 2, glow: "#ff4400" } 
      : { color: "#ffffff", emissiveIntensity: 1.2, glow: "#ffaa00" }; 
  }, [weatherStatus]);

  useFrame((state, delta) => {
    if (groupRef.current && !isHoveringRef.current) {
      groupRef.current.rotation.y += delta * 0.02; // Slower, realistic rotation
    }
  });

  const handlePointHover = (point: SpacePoint) => {
    isHoveringRef.current = true;
    onPointHover(point);
    document.body.style.cursor = "pointer";

    if (groupRef.current) {
      // Rotate the group to face the point to camera
      const targetY = -point.position.theta;
      const targetX = point.position.phi - Math.PI / 2;

      gsap.to(groupRef.current.rotation, {
        x: targetX,
        y: targetY,
        z: 0,
        duration: 1.5,
        ease: "power2.out",
        overwrite: true
      });
    }
  };

  const handlePointLeave = () => {
    isHoveringRef.current = false;
    onPointHover(null);
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={groupRef}>
      {/* --- LAYER 1: The Sun Sphere (Using YOUR Image) --- */}
      <mesh>
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshStandardMaterial 
          map={sunTexture} 
          emissiveMap={sunTexture}
          emissive={new THREE.Color("#ffffff")}
          emissiveIntensity={config.emissiveIntensity}
          color={config.color} // Tints the texture slightly red in storm mode
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* --- LAYER 2: Atmosphere Glow (Simple Halo) --- */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[3.0, 32, 32]} />
        <meshBasicMaterial
          color={config.glow}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* --- LAYER 3: Interactive Points --- */}
      {sunPoints.map((point) => {
        const radius = 3.22; // Just slightly above surface
        const x = radius * Math.sin(point.position.phi) * Math.cos(point.position.theta);
        const y = radius * Math.cos(point.position.phi);
        const z = radius * Math.sin(point.position.phi) * Math.sin(point.position.theta);

        return (
          <group 
            key={point.id} 
            position={[x, y, z]} 
            lookAt={new THREE.Vector3(0,0,0)}
          >
            {/* Hitbox */}
            <mesh
              visible={false}
              onClick={(e) => {
                e.stopPropagation();
                onPointClick(point);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                handlePointHover(point);
              }}
              onPointerOut={handlePointLeave}
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial color="red" />
            </mesh>

            {/* Visual Ring Marker */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.08, 0.1, 32]} />
                <meshBasicMaterial 
                    color="white" 
                    side={THREE.DoubleSide} 
                    transparent 
                    opacity={0.8}
                    blending={THREE.AdditiveBlending} 
                    depthTest={false}
                />
            </mesh>
            
            {/* Center Dot */}
            <mesh>
                 <sphereGeometry args={[0.03]} />
                 <meshBasicMaterial color="cyan" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}