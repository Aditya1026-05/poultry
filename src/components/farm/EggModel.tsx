import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Egg() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  return (
    <mesh ref={ref} scale={[1, 1.35, 1]} castShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color="#e8d4ad"
        roughness={0.35}
        clearcoat={0.6}
        clearcoatRoughness={0.4}
        sheen={0.4}
        sheenColor="#fff1c4"
      />
    </mesh>
  );
}

function Ring() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.2, 0, 0]}>
      <torusGeometry args={[1.9, 0.012, 16, 128]} />
      <meshStandardMaterial color="#e8b94a" emissive="#e8b94a" emissiveIntensity={0.6} />
    </mesh>
  );
}

export default function EggModel() {
  return (
    <Canvas dpr={[1, 1.8]} camera={{ position: [0, 0, 4], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} color="#ffe0a8" />
      <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#7fd7a2" />
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
          <Egg />
        </Float>
        <Ring />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
