import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/* Stylized chicken built from primitives */
function Chicken({
  position,
  scale = 1,
  speed = 0.6,
  tint = "#f5f1e6",
  combColor = "#c0392b",
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  tint?: string;
  combColor?: string;
}) {
  const group = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Mesh>(null!);
  const legR = useRef<THREE.Mesh>(null!);
  const start = useMemo(() => Math.random() * Math.PI * 2, []);
  const radius = useMemo(() => 1.2 + Math.random() * 0.8, []);
  const cx = position[0];
  const cz = position[2];

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + start;
    if (group.current) {
      const x = cx + Math.cos(t) * radius;
      const z = cz + Math.sin(t) * radius;
      group.current.position.x = x;
      group.current.position.z = z;
      group.current.position.y = position[1] + Math.abs(Math.sin(t * 6)) * 0.04;
      // face direction of motion
      group.current.rotation.y = -t + Math.PI / 2;
    }
    if (head.current) {
      head.current.rotation.x = Math.sin(t * 4) * 0.15;
    }
    if (legL.current && legR.current) {
      legL.current.rotation.x = Math.sin(t * 8) * 0.5;
      legR.current.rotation.x = -Math.sin(t * 8) * 0.5;
    }
  });

  return (
    <group ref={group} scale={scale} position={position}>
      {/* body */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={tint} roughness={0.7} />
      </mesh>
      {/* tail */}
      <mesh castShadow position={[-0.35, 0.6, 0]} rotation={[0, 0, 0.6]}>
        <coneGeometry args={[0.18, 0.45, 16]} />
        <meshStandardMaterial color={tint} roughness={0.8} />
      </mesh>
      {/* head */}
      <group ref={head} position={[0.35, 0.78, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={tint} roughness={0.6} />
        </mesh>
        {/* comb */}
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[0.08, 0.18, 12]} />
          <meshStandardMaterial color={combColor} roughness={0.5} />
        </mesh>
        {/* beak */}
        <mesh position={[0.22, -0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.14, 12]} />
          <meshStandardMaterial color="#e8a93a" roughness={0.4} />
        </mesh>
        {/* eyes */}
        <mesh position={[0.16, 0.05, 0.13]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.16, 0.05, -0.13]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
      {/* legs */}
      <mesh ref={legL} castShadow position={[0.05, 0.18, 0.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
        <meshStandardMaterial color="#d4a256" />
      </mesh>
      <mesh ref={legR} castShadow position={[0.05, 0.18, -0.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
        <meshStandardMaterial color="#d4a256" />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[20, 64]} />
      <meshStandardMaterial color="#2a3a22" roughness={1} />
    </mesh>
  );
}

function Grass() {
  const blades = useMemo(() => {
    const arr: { p: [number, number, number]; r: number; s: number }[] = [];
    for (let i = 0; i < 220; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1 + Math.random() * 7;
      arr.push({
        p: [Math.cos(angle) * r, 0.08, Math.sin(angle) * r],
        r: Math.random() * Math.PI,
        s: 0.6 + Math.random() * 0.8,
      });
    }
    return arr;
  }, []);
  return (
    <group>
      {blades.map((b, i) => (
        <mesh key={i} position={b.p} rotation={[0, b.r, 0]} scale={[1, b.s, 1]}>
          <coneGeometry args={[0.03, 0.18, 4]} />
          <meshStandardMaterial color="#4a6a32" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = Math.random() * 5 + 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < 400; i++) {
        const y = pos.getY(i) + 0.003;
        pos.setY(i, y > 6 ? 0.5 : y);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#f5d68a" size={0.04} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#0c1810", 8, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.6}
        color="#ffd9a0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 5, -3]} intensity={0.4} color="#7fd7a2" />

      <Ground />
      <Grass />

      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.1}>
        <Chicken position={[0, 0, 0]} scale={1.1} speed={0.4} tint="#efe6d0" />
      </Float>
      <Chicken position={[2.5, 0, -1]} scale={0.9} speed={0.5} tint="#c89860" combColor="#a52a2a" />
      <Chicken position={[-2.2, 0, 1.5]} scale={0.85} speed={0.55} tint="#3b2a20" combColor="#c0392b" />
      <Chicken position={[1.5, 0, 2.5]} scale={0.7} speed={0.7} tint="#f5f1e6" />
      <Chicken position={[-3, 0, -2]} scale={0.95} speed={0.45} tint="#8a6a48" />

      <Particles />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={20} blur={2.4} far={4} />
      <Environment preset="sunset" />
    </>
  );
}

export default function FarmScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 2.4, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
