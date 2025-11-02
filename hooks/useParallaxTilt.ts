import { useEffect, useMemo, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { Platform } from "react-native";

export type ParallaxTilt = {
  tiltX: number; // -1..1
  tiltY: number; // -1..1
};

export default function useParallaxTilt(enabled: boolean = true): ParallaxTilt {
  const [data, setData] = useState({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (Platform.OS === "web" || !enabled) return;

    let sub: any;
    Accelerometer.setUpdateInterval(50);
    sub = Accelerometer.addListener(({ x, y }) => {
      // normaliza e inverte alguns eixos para uma sensação natural
      target.current.x = Math.max(-1, Math.min(1, x ?? 0));
      target.current.y = Math.max(-1, Math.min(1, -(y ?? 0)));
    });

    const loop = () => {
      // amortecimento / low-pass filter
      smoothed.current.x += (target.current.x - smoothed.current.x) * 0.08;
      smoothed.current.y += (target.current.y - smoothed.current.y) * 0.08;
      setData({ x: smoothed.current.x, y: smoothed.current.y });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (sub) sub.remove();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  return useMemo(() => ({ tiltX: data.x, tiltY: data.y }), [data]);
}
