import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function DustParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 800 subtle golden dust particles
  const [positions, colors] = useMemo(() => {
    const particleCount = 800;
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Spread them in a large volume
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Golden hues
      const intensity = 0.5 + Math.random() * 0.5;
      col[i * 3] = 0.8 * intensity;     // R
      col[i * 3 + 1] = 0.65 * intensity; // G
      col[i * 3 + 2] = 0.4 * intensity;  // B
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Very slow, majestic rotation
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
      
      // Slight vertical drift based on time
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function ThreeDustField() {
  return (
    <div className="fixed inset-0 w-screen h-screen pointer-events-none z-[15]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <DustParticles />
      </Canvas>
    </div>
  );
}
