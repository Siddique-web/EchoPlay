/**
 * Tema personalizado do aplicativo EchoPlay 🎵
 * Inclui suporte a modo claro/escuro, cores modernas e fontes dinâmicas.
 */

import { Platform } from "react-native";

const tintColorLight = "#007BFF"; // Azul principal (modo claro)
const tintColorDark = "#1E90FF"; // Azul claro (modo escuro)

// 🎨 Paleta de cores moderna
export const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    card: "#F4F4F4",
    tint: tintColorLight,
    icon: "#687076",
    border: "#E0E0E0",
    muted: "#6C757D",
    success: "#28A745",
    danger: "#DC3545",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#0D0F10",
    card: "#1C1E20",
    tint: tintColorDark,
    icon: "#9BA1A6",
    border: "#2A2D2F",
    muted: "#9BA1A6",
    success: "#28A745",
    danger: "#DC3545",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

// 🖋️ Fontes dinâmicas e modernas
export const Fonts = Platform.select({
  ios: {
    primary: "Montserrat",
    secondary: "Times New Roman",
    title: "Poppins",
    accent: "Avenir Next",
    mono: "Courier New",
  },
  android: {
    primary: "Montserrat",
    secondary: "serif",
    title: "Poppins",
    accent: "sans-serif-medium",
    mono: "monospace",
  },
  web: {
    primary: "'Montserrat', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    secondary: "'Times New Roman', Georgia, serif",
    title: "'Poppins', 'Segoe UI', Roboto, sans-serif",
    accent: "'Montserrat Alternates', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
  default: {
    primary: "System",
    secondary: "System",
    title: "System",
    accent: "System",
    mono: "monospace",
  },
});

// 📏 Tamanhos e espaçamentos
export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  title: 22,
  subtitle: 18,
  small: 12,
};

// 🧩 Tema unificado
const theme = { Colors, Fonts, SIZES };

export default theme;
