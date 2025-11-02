import React from "react";
import { View } from "react-native";

export type NoisePlasmaProps = {
  width?: number;
  height?: number;
  speed?: number;
  palette?: string[];
  opacity?: number;
};

export default function NoisePlasma({ width = 0, height = 0, opacity = 0 }: NoisePlasmaProps) {
  return <View style={{ width, height, opacity }} />;
}
