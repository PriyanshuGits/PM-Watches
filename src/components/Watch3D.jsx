import { Canvas } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";

function WatchModel() {
  return (
    <group rotation={[0, 0, 0]} scale={0.8}>
      {/* TOP STRAP */}
      <RoundedBox
       args={[1.45, 2.3, 0.22]}
        radius={0.13}
        smoothness={8}
        position={[0, 2.18, -0.08]}
      >
        <meshStandardMaterial color="#171717" roughness={0.32} />
      </RoundedBox>

      {/* BOTTOM STRAP */}
      <RoundedBox
       args={[1.45, 2.3, 0.22]}
        radius={0.13}
        smoothness={8}
        position={[0, -2.18, -0.08]}
      >
        <meshStandardMaterial color="#171717" roughness={0.32} />
      </RoundedBox>

      {/* WATCH BODY */}
      <RoundedBox
        args={[2.8, 3.3, 0.45]}
        radius={0.38}
        smoothness={10}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#171717"
          metalness={0.75}
          roughness={0.22}
        />
      </RoundedBox>

      {/* GLASS / DISPLAY */}
      <RoundedBox
        args={[2.48, 2.95, 0.08]}
        radius={0.3}
        smoothness={10}
        position={[0, 0, 0.27]}
      >
        <meshStandardMaterial
          color="#050505"
          metalness={0.15}
          roughness={0.08}
        />
      </RoundedBox>

      {/* DISPLAY TIME */}
      <Text
        position={[0, 0.72, 0.34]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        10:09
      </Text>

      {/* DATE */}
      <Text
        position={[0, 0.36, 0.34]}
        fontSize={0.1}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        MONDAY • 21 OCT
      </Text>

      {/* HEART RATE */}
      <Text
        position={[-0.62, -0.42, 0.34]}
        fontSize={0.11}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
      >
        ♥ 72 BPM
      </Text>

      {/* STEPS */}
      <Text
        position={[0.62, -0.42, 0.34]}
        fontSize={0.11}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
      >
        8,421
      </Text>

      {/* ONLY ONE CROWN */}
      <mesh position={[1.52, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.28, 32]} />

        <meshStandardMaterial
          color="#b8b8b8"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

export default function Watch3D({ enableRotate = true }) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 8],
        fov: 35,
      }}
    >
      <ambientLight intensity={0.7} />

      <directionalLight position={[5, 6, 5]} intensity={3} />

      <directionalLight position={[-4, 2, 4]} intensity={1.5} />

      <pointLight position={[2, 1, 4]} intensity={2} />

      <WatchModel />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={enableRotate}
      />
    </Canvas>
  );
}
