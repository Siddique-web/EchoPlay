import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, View, ViewProps } from "react-native";

export type GlassCardProps = ViewProps & {
  active?: boolean; // foco/atividade do formulário
  radius?: number;
};

export default function GlassCard({ active = false, radius = 24, style, children, ...rest }: GlassCardProps) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (active) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 1200, useNativeDriver: false }),
        ])
      );
      loop.start();
    } else {
      glow.stopAnimation();
      glow.setValue(0);
    }
    return () => {
      loop?.stop();
    };
  }, [active]);

  const borderOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.45] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] });

  const common = [
    {
      borderRadius: radius,
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.12)",
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.28)",
    },
    style,
  ];

  return (
    <View {...rest} style={common as any}>
      {/* Blur do conteúdo por trás criando efeito vítreo */}
      <View style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden" /* Removed pointerEvents: "none" */ }}>
        <BlurView intensity={40} tint={Platform.OS === "ios" ? "light" : "default"} style={{ flex: 1 }} />
      </View>
      {/* Glow/bloom de borda respirando */}
      <Animated.View
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,1)",
          opacity: borderOpacity,
          // pointerEvents: "none", // Removed to fix animation conflict
        }}
      />
      {/* Sombra/halo externa (web usa boxShadow, mobile elevation + shadowOpacity animada) */}
      {Platform.OS === "web" ? (
        <Animated.View
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            boxShadow: `0 8px 32px rgba(0,0,0,${(active ? 0.18 : 0.12).toFixed(2)})`,
            // pointerEvents: "none", // Removed to fix animation conflict
          } as any}
        />
      ) : (
        <Animated.View
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 24,
            shadowOpacity: (active ? 0.22 : 0.12),
            elevation: 8,
            opacity: shadowOpacity,
            // pointerEvents: "none", // Removed to fix animation conflict
          }}
        />
      )}
      <View style={{ padding: 20 }}>{children}</View>
    </View>
  );
}