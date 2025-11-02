import { Stack } from 'expo-router';
import React from 'react';

export default function ImmersiveLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="visualizer" options={{ headerShown: false }} />
      <Stack.Screen name="ambient-mode" options={{ headerShown: false }} />
      <Stack.Screen name="mood-editor" options={{ headerShown: false }} />
    </Stack>
  );
}