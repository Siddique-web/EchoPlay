import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Platform, View } from "react-native";
import {
  Canvas,
  Path,
  Skia,
  vec,
  LinearGradient,
  Group,
  BlurMask,
} from "@shopify/react-native-skia";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export type WavesGPUProps = {
  width?: number;
  height?: number;
  intensity?: number; // amplitude das ondas
  speed?: number; // velocidade da animação
  opacity?: number; // opacidade geral
  palette?: string[]; // cores do gradiente
};

export default function WavesGPU({
  width = SCREEN_W,
  height = 220,
  intensity = 14,
  speed = 1,
  opacity = 0.9,
  palette = ["#0d6efd", "#ffd029", "#ffffff", "#39ff14"],
}: WavesGPUProps) {
  // Fallback para web: o caller deve evitar renderizar este componente no Web.
  if (Platform.OS === "web") {
    return <View style={{ width, height }} />;
  }

  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    let start = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = (now - start) / 1000;
      // avança de forma contínua com base no tempo decorrido e velocidade
      setTick(dt * speed);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed]);

  // Cores do gradiente (suave)
  const colors = useMemo(() => {
    if (palette.length < 2) return ["#0d6efd", "#39ff14"]; 
    return palette;
  }, [palette]);

  // Define três ondas com fase diferente
  const waves = [
    { amp: 1.0, freq: 1.0, phase: 0 },
    { amp: 0.7, freq: 1.3, phase: Math.PI / 2 },
    { amp: 0.5, freq: 1.8, phase: Math.PI },
  ];

  const paths = useMemo(() => {
    const t = tick; // segundos animados
    return waves.map(({ amp, freq, phase }) => {
      const p = Skia.Path.Make();
      const A = intensity * amp;
      const yBase = height * 0.5;
      const step = 8; // px por amostra
      p.moveTo(0, yBase);
      for (let x = 0; x <= width; x += step) {
        const y = yBase + A * Math.sin((x / width) * Math.PI * 2 * freq + t + phase);
        p.lineTo(x, y);
      }
      // fecha em baixo para preencher
      p.lineTo(width, height);
      p.lineTo(0, height);
      p.close();
      return p;
    });
  }, [tick, width, height, intensity]);

  return (
    <Canvas style={{ width, height, opacity }}>
      {/* Gradiente de fundo suave dentro do grupo */}
      <Group>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={colors}
        />
      </Group>

      {/* Ondas com leve blur para um glow sutil */}
      <Group>
        {paths.map((path, i) => (
          <Path
            key={`w-${i}`}
            path={path}
            color={i === 0 ? "rgba(0,120,255,0.35)" : i === 1 ? "rgba(0,120,255,0.25)" : "rgba(0,120,255,0.18)"}
          >
            <BlurMask blur={Math.max(2, 8 - i * 2)} style="inner" />
          </Path>
        ))}
      </Group>
    </Canvas>
  );
}
