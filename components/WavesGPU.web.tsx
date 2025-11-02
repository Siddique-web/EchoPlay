import React from "react";
import { View } from "react-native";

export type WavesGPUProps = {
  width?: number;
  height?: number;
  intensity?: number;
  speed?: number;
  opacity?: number;
  palette?: string[];
};

// Web fallback: no Skia import here. The AnimatedBackground already has a JS fallback for web waves.
export default function WavesGPU({ width = 0, height = 0, opacity = 0.0 }: WavesGPUProps) {
  return <View style={{ width, height, opacity }} />;
}
