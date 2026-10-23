import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox } from "@react-three/drei";

function AnalogWatch({
  mode,
  onCrownClick,
  stopwatchTime,
  stopwatchRunning,
  onStopwatchToggle,
  onStopwatchReset,
}) {
  const hourHand = useRef();
  const minuteHand = useRef();
  const secondHand = useRef();

  /* ================================
     REAL CLOCK HAND MOVEMENT
  ================================= */

  useFrame(() => {
    const now = new Date();

    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondProgress =
      (seconds + milliseconds / 1000) / 60;

    const minuteProgress =
      (minutes + seconds / 60) / 60;

    const hourProgress =
      ((hours % 12) + minutes / 60) / 12;

    if (secondHand.current) {
      secondHand.current.rotation.z =
        -secondProgress * Math.PI * 2;
    }

    if (minuteHand.current) {
      minuteHand.current.rotation.z =
        -minuteProgress * Math.PI * 2;
    }

    if (hourHand.current) {
      hourHand.current.rotation.z =
        -hourProgress * Math.PI * 2;
    }
  });

  /* ================================
     CURRENT DATE
  ================================= */

  const currentDate = new Date();

  const dateText = currentDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <group rotation={[0, 0, 0]} scale={0.85}>

      {/* ================================
          STRAP
      ================================= */}

      <mesh position={[0, 2.35, -0.12]}>
        <boxGeometry args={[1.05, 2.2, 0.18]} />

        <meshStandardMaterial
          color="#171717"
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, -2.35, -0.12]}>
        <boxGeometry args={[1.05, 2.2, 0.18]} />

        <meshStandardMaterial
          color="#171717"
          roughness={0.5}
        />
      </mesh>

      {/* ================================
          OUTER METAL CASE
      ================================= */}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[1.55, 1.55, 0.42, 64]}
        />

        <meshStandardMaterial
          color="#c5c5c5"
          metalness={0.95}
          roughness={0.16}
        />
      </mesh>

      {/* ================================
          DARK BEZEL
      ================================= */}

      <mesh
        position={[0, 0, 0.23]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[1.42, 1.42, 0.1, 64]}
        />

        <meshStandardMaterial
          color="#151515"
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* ================================
          DIAL
      ================================= */}

      <mesh
        position={[0, 0, 0.3]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[1.3, 1.3, 0.06, 64]}
        />

        <meshStandardMaterial
          color="#e7e4dc"
          roughness={0.35}
        />
      </mesh>

      {/* ================================
          BRAND
      ================================= */}

      <Text
        position={[0, 0.68, 0.35]}
        fontSize={0.12}
        color="#555555"
        anchorX="center"
        anchorY="middle"
      >
        PM WATCHES
      </Text>

      {/* ================================
          MODE LABEL
      ================================= */}

      <Text
        position={[0, -0.68, 0.35]}
        fontSize={0.09}
        color="#777777"
        anchorX="center"
        anchorY="middle"
      >
        {mode === 0
          ? "TIME"
          : mode === 1
          ? "DATE"
          : "STOPWATCH"}
      </Text>

      {/* ================================
          CLOCK NUMBERS
      ================================= */}

      <Text
        position={[0, 0.95, 0.35]}
        fontSize={0.18}
        color="#222222"
        anchorX="center"
        anchorY="middle"
      >
        XII
      </Text>

      <Text
        position={[0, -0.98, 0.35]}
        fontSize={0.18}
        color="#222222"
        anchorX="center"
        anchorY="middle"
      >
        VI
      </Text>

      <Text
        position={[0.98, 0, 0.35]}
        fontSize={0.16}
        color="#222222"
        anchorX="center"
        anchorY="middle"
      >
        III
      </Text>

      <Text
        position={[-0.98, 0, 0.35]}
        fontSize={0.16}
        color="#222222"
        anchorX="center"
        anchorY="middle"
      >
        IX
      </Text>

      {/* ================================
          DATE MODE
      ================================= */}

      {mode === 1 && (
        <group position={[0, -0.05, 0.38]}>

          <Text
            position={[0, 0.18, 0]}
            fontSize={0.16}
            color="#222222"
            anchorX="center"
            anchorY="middle"
          >
            TODAY
          </Text>

          <Text
            position={[0, -0.12, 0]}
            fontSize={0.20}
            color="#171717"
            anchorX="center"
            anchorY="middle"
          >
            {dateText}
          </Text>

        </group>
      )}

      {/* ================================
          STOPWATCH MODE
      ================================= */}

      {mode === 2 && (
        <group>

          {/* Stopwatch Time */}

          <Text
            position={[0, 0.05, 0.38]}
            fontSize={0.27}
            color="#171717"
            anchorX="center"
            anchorY="middle"
          >
            {stopwatchTime}
          </Text>

          {/* START / STOP */}

          <group
            position={[-0.38, -0.42, 0.4]}
            onPointerDown={(event) => {
              event.stopPropagation();
              onStopwatchToggle();
            }}
          >

            <RoundedBox
              args={[0.55, 0.22, 0.05]}
              radius={0.06}
              smoothness={5}
            >
              <meshStandardMaterial
                color="#222222"
                metalness={0.5}
                roughness={0.3}
              />
            </RoundedBox>

            <Text
              position={[0, 0, 0.04]}
              fontSize={0.075}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {stopwatchRunning
                ? "STOP"
                : "START"}
            </Text>

          </group>

          {/* RESET */}

          <group
            position={[0.38, -0.42, 0.4]}
            onPointerDown={(event) => {
              event.stopPropagation();
              onStopwatchReset();
            }}
          >

            <RoundedBox
              args={[0.55, 0.22, 0.05]}
              radius={0.06}
              smoothness={5}
            >
              <meshStandardMaterial
                color="#222222"
                metalness={0.5}
                roughness={0.3}
              />
            </RoundedBox>

            <Text
              position={[0, 0, 0.04]}
              fontSize={0.075}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              RESET
            </Text>

          </group>

        </group>
      )}

      {/* ================================
          REAL CLOCK HANDS
          ONLY IN TIME MODE
      ================================= */}

      {mode === 0 && (
        <group position={[0, 0, 0.40]}>

          {/* HOUR HAND */}

          <group ref={hourHand}>
            <mesh position={[0, 0.275, 0]}>
              <boxGeometry
                args={[0.10, 0.55, 0.045]}
              />

              <meshStandardMaterial
                color="#171717"
                metalness={0.6}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* MINUTE HAND */}

          <group ref={minuteHand}>
            <mesh position={[0, 0.36, 0.01]}>
              <boxGeometry
                args={[0.055, 0.72, 0.045]}
              />

              <meshStandardMaterial
                color="#171717"
                metalness={0.6}
                roughness={0.2}
              />
            </mesh>
          </group>

          {/* GOLD SECOND HAND */}

          <group ref={secondHand}>
            <mesh position={[0, 0.41, 0.02]}>
              <boxGeometry
                args={[0.018, 0.82, 0.025]}
              />

              <meshStandardMaterial
                color="#b08a45"
                metalness={0.9}
                roughness={0.12}
              />
            </mesh>
          </group>

          {/* CENTER PIN */}

          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry
              args={[0.13, 24, 24]}
            />

            <meshStandardMaterial
              color="#b08a45"
              metalness={0.95}
              roughness={0.12}
            />
          </mesh>

        </group>
      )}

      {/* ================================
          CROWN
      ================================= */}

      <mesh
        position={[1.67, 0.15, 0]}
        rotation={[0, 0, Math.PI / 2]}
        onPointerDown={(event) => {
          event.stopPropagation();
          onCrownClick();
        }}
      >

        <cylinderGeometry
          args={[0.15, 0.15, 0.28, 32]}
        />

        <meshStandardMaterial
          color="#c5c5c5"
          metalness={0.95}
          roughness={0.15}
        />

      </mesh>

    </group>
  );
}

export default function AnalogWatch3D() {

  /* ================================
     MODE
  ================================= */

  const [mode, setMode] = useState(0);

  /* ================================
     STOPWATCH
  ================================= */

  const [stopwatchRunning, setStopwatchRunning] =
    useState(false);

  const [stopwatchStart, setStopwatchStart] =
    useState(null);

  const [stopwatchElapsed, setStopwatchElapsed] =
    useState(0);

  const [, forceUpdate] = useState(0);

  /* ================================
     LIVE UPDATE
  ================================= */

  useEffect(() => {

    const timer = setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 100);

    return () => clearInterval(timer);

  }, []);

  /* ================================
     CROWN
  ================================= */

  const handleCrownClick = () => {

    setMode((currentMode) => {

      return (currentMode + 1) % 3;

    });

  };

  /* ================================
     STOPWATCH TOGGLE
  ================================= */

  const handleStopwatchToggle = () => {

    if (stopwatchRunning) {

      const elapsed =
        Date.now() - stopwatchStart;

      setStopwatchElapsed(
        (previous) => previous + elapsed
      );

      setStopwatchRunning(false);
      setStopwatchStart(null);

    } else {

      setStopwatchStart(Date.now());
      setStopwatchRunning(true);

    }

  };

  /* ================================
     STOPWATCH RESET
  ================================= */

  const handleStopwatchReset = () => {

    setStopwatchRunning(false);
    setStopwatchStart(null);
    setStopwatchElapsed(0);

  };

  /* ================================
     STOPWATCH TIME
  ================================= */

  let totalElapsed =
    stopwatchElapsed;

  if (
    stopwatchRunning &&
    stopwatchStart
  ) {

    totalElapsed +=
      Date.now() - stopwatchStart;

  }

  const totalSeconds =
    Math.floor(totalElapsed / 1000);

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  const stopwatchTime =
    `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  return (
    <Canvas camera={{ position: [0, 0, 6.5], fov: 40 }}>

      {/* LIGHTING */}

      <ambientLight intensity={0.8} />

      <directionalLight
        position={[5, 6, 5]}
        intensity={3}
      />

      <directionalLight
        position={[-4, 2, 4]}
        intensity={1.5}
      />

      <pointLight
        position={[2, 1, 4]}
        intensity={2}
      />

      {/* WATCH */}

      <AnalogWatch
        mode={mode}
        onCrownClick={handleCrownClick}
        stopwatchTime={stopwatchTime}
        stopwatchRunning={stopwatchRunning}
        onStopwatchToggle={handleStopwatchToggle}
        onStopwatchReset={handleStopwatchReset}
      />

      {/* CONTROLS */}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
      />

    </Canvas>
  );
}