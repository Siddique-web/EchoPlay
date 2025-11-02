import React, { useState } from "react";
import { StyleSheet } from "react-native";
import AnimatedBackground from "../components/AnimatedBackground";
import SignUpScreen from "../components/AnimatedSignUp";

export default function LoginScreen() {
  const [showSignUp, setShowSignUp] = useState(false);

  const navigateToSignUp = () => {
    setShowSignUp(true);
  };

  const navigateToLogin = () => {
    setShowSignUp(false);
  };

  return showSignUp ? (
    <SignUpScreen onNavigateToLogin={navigateToLogin} />
  ) : (
    <AnimatedBackground onNavigateToSignUp={navigateToSignUp} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});