import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, View, Dimensions } from "react-native";
import { Canvas, Group, LinearGradient, vec } from "@shopify/react-native-skia";

// Nota: Skia não expõe ruído Perlin pronto. Usamos um truque simples: várias camadas de gradiente
// com offsets/rotations animados criando um efeito "plasma" suave. Leve e funciona bem em GPU.

export type NoisePlasmaProps = {
  width?: number;
  height?: number;
  speed?: number; // velocidade do swirl dos gradientes
  palette?: string[]; // cores do plasma
  opacity?: number;
};

const { width: W, height: H } = Dimensions.get("window");

export default function NoisePlasma({
  width = W,
  height = 260,
  speed = 0.6,
  opacity = 0.6,
  palette = ["#0d6efd", "#ffd029", "#ffffff", "#39ff14"],
}: NoisePlasmaProps) {
  if (Platform.OS === "web") return <View style={{ width, height }} />;

  const [tick, setTick] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    let start = Date.now();
    const loop = () => {
      const now = Date.now();
      setTick(((now - start) / 1000) * speed);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [speed]);

  const colors = useMemo(() => (palette.length < 2 ? ["#0d6efd", "#39ff14"] : palette), [palette]);

  // Três gradientes com offsets animados e rotações diferentes
  const rotA = (tick * 20) % 360;
  const rotB = (tick * 28 + 60) % 360;
  const rotC = (tick * 36 + 120) % 360;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const p = (cx: number, cy: number, r: number, ang: number) => vec(cx + r * Math.cos(toRad(ang)), cy + r * Math.sin(toRad(ang)));

  const cx = width / 2;
  const cy = height / 2;
  const r = Math.max(width, height) * 0.75;

  return (
    <Canvas style={{ width, height, opacity }}>
      <Group>
        <LinearGradient start={p(cx, cy, r, rotA)} end={p(cx, cy, r, rotA + 180)} colors={[colors[0], colors[1]]} />
      </Group>
      <Group>
        <LinearGradient start={p(cx, cy, r, rotB)} end={p(cx, cy, r, rotB + 180)} colors={[colors[1] ?? colors[0], colors[2] ?? colors[1] ?? colors[0]]} />
      </Group>
      <Group>
        <LinearGradient start={p(cx, cy, r, rotC)} end={p(cx, cy, r, rotC + 180)} colors={[colors[2] ?? colors[1] ?? colors[0], colors[3] ?? colors[2] ?? colors[1] ?? colors[0]]} />
      </Group>
    </Canvas>
  );
}
