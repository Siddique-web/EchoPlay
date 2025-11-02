import { useAuth } from '@/contexts/AuthContext';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold, useFonts } from "@expo-google-fonts/montserrat";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import useParallaxTilt from "../hooks/useParallaxTilt";
import GlassCard from "./GlassCard";
import NoisePlasma from "./NoisePlasma";
import WavesGPU from "./WavesGPU";

const { width, height } = Dimensions.get("window");

const BUBBLES = [
  { cx: 80, cy: 300, r: 28, color: "rgba(0, 136, 255, 0.45)" },
  { cx: width - 100, cy: 420, r: 44, color: "rgba(0, 170, 255, 0.40)" },
  { cx: width / 2, cy: height - 220, r: 56, color: "rgba(0, 200, 255, 0.35)" },
  { cx: 150, cy: height - 120, r: 34, color: "rgba(0, 180, 255, 0.38)" },
  { cx: width - 150, cy: 260, r: 48, color: "rgba(0, 150, 255, 0.42)" },
];

export default function SignUpScreen({ onNavigateToLogin }: { onNavigateToLogin: () => void }) {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formKey, setFormKey] = useState(0);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const colorAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnims = useRef(BUBBLES.map(() => new Animated.Value(0))).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [confirmPassError, setConfirmPassError] = useState<string | null>(null);
  const [passStrength, setPassStrength] = useState(0);
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const nameLabelAnim = useRef(new Animated.Value(0)).current;
  const emailLabelAnim = useRef(new Animated.Value(0)).current;
  const passLabelAnim = useRef(new Animated.Value(0)).current;
  const confirmPassLabelAnim = useRef(new Animated.Value(0)).current;

  // Clear fields on mount
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    if (Platform.OS === "web") {
      setFormKey((k) => k + 1);
      const t1 = setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }, 50);
      const t2 = setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // Color sequence for background
  const colorSequence = ["#0d6efd", "#ffd029", "#ffffff", "#39ff14"];

  // Background animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(colorAnim, {
        toValue: colorSequence.length - 1,
        duration: 16000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      })
    ).start();

    bubbleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000 + i * 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 4000 + i * 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    });

    const loopWave = (anim: Animated.Value, delay = 0) => {
      const run = () => {
        anim.setValue(0);
        Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration: 6000,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        ).start();
      };
      if (delay) {
        const t = setTimeout(run, delay);
        return () => clearTimeout(t);
      }
      run();
      return () => {};
    };

    const c1 = loopWave(waveAnim1, 0);
    const c2 = loopWave(waveAnim2, 800);
    const c3 = loopWave(waveAnim3, 1600);

    return () => {
      c1?.();
      c2?.();
      c3?.();
    };
  }, []);

  // Label animations
  useEffect(() => {
    const to = nameFocused || name ? 1 : 0;
    Animated.timing(nameLabelAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [nameFocused, name]);

  useEffect(() => {
    const to = emailFocused || email ? 1 : 0;
    Animated.timing(emailLabelAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [emailFocused, email]);

  useEffect(() => {
    const to = passFocused || password ? 1 : 0;
    Animated.timing(passLabelAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [passFocused, password]);

  useEffect(() => {
    const to = confirmPassFocused || confirmPassword ? 1 : 0;
    Animated.timing(confirmPassLabelAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [confirmPassFocused, confirmPassword]);

  // Validation functions
  const validateName = (v: string) => v.length >= 2;
  const validateEmail = (v: string) => /^(?:[a-zA-Z0-9_'^&\/+\-]+(?:\.[a-zA-Z0-9_'^&\/+\-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(v);
  const calcPassStrength = (v: string) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[!@#$%^&*(),.?":{}|<>_+\-]/.test(v)) s++;
    if (/[A-Z]/.test(v)) s++;
    return Math.min(s, 4);
  };

  // Validation effects
  useEffect(() => {
    if (!name) setNameError(null);
    else setNameError(validateName(name) ? null : "Nome muito curto");
  }, [name]);

  useEffect(() => {
    if (!email) setEmailError(null);
    else setEmailError(validateEmail(email) ? null : "Email inválido");
  }, [email]);

  useEffect(() => {
    const s = calcPassStrength(password);
    setPassStrength(s);
    if (!password) setPassError(null);
    else setPassError(s >= 2 ? null : "Senha fraca");
  }, [password]);

  useEffect(() => {
    if (!confirmPassword) setConfirmPassError(null);
    else setConfirmPassError(password === confirmPassword ? null : "As senhas não coincidem");
  }, [password, confirmPassword]);

  const hasError = !!nameError || !!emailError || !!passError || !!confirmPassError;
  const anyFocused = nameFocused || emailFocused || passFocused || confirmPassFocused;

  // Parallax effect
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";
  const { tiltX, tiltY } = useParallaxTilt(isMobile);
  const tiltToDeg = (v: number) => v * 3;

  const backgroundColor = colorAnim.interpolate({
    inputRange: colorSequence.map((_, i) => i),
    outputRange: colorSequence,
  });

  // Breathing overlay
  const breatheAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(breatheAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const breatheOpacity = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] });

  const waveOpacityBoost = anyFocused ? 0.08 : 0;
  const waveErrorBoost = hasError ? 0.12 : 0;
  const wave1Color = `rgba(0,120,255,${0.25 + waveOpacityBoost + waveErrorBoost})`;
  const wave2Color = `rgba(0,120,255,${0.18 + waveOpacityBoost + waveErrorBoost})`;
  const wave3Color = `rgba(0,120,255,${0.12 + waveOpacityBoost + waveErrorBoost})`;

  if (!fontsLoaded) return null;

  const handleRegister = async () => {
    if (btnState === "loading") return;
    const invalid = !name || !email || !password || !confirmPassword || hasError;
    if (invalid) {
      setBtnState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]).start();
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPassError("As senhas não coincidem");
      setBtnState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]).start();
      return;
    }
    setBtnState("loading");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await register(name, email, password);
      setBtnState("success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to home screen after successful registration
      setTimeout(() => {
        router.push('/(tabs)/home');
      }, 1000);
    } catch (error: any) {
      setBtnState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]).start();
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Breathing overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor, opacity: breatheOpacity }]} />
      
      {/* Background elements */}
      {isMobile && (
        <Animated.View
          style={{
            position: "absolute",
            top: height * 0.35,
            width,
            height: 260,
            transform: [
              { translateX: (tiltX || 0) * 12 },
              { translateY: (tiltY || 0) * 8 },
              { rotateX: `${tiltToDeg(tiltY || 0)}deg` },
              { rotateY: `${tiltToDeg(tiltX || 0)}deg` },
            ],
          }}
        >
          <NoisePlasma width={width} height={260} opacity={0.5} />
        </Animated.View>
      )}
      
      {BUBBLES.map((bubble, i) => {
        const scale = bubbleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] });
        const opacity = bubbleAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              top: bubble.cy - bubble.r,
              left: bubble.cx - bubble.r,
              width: bubble.r * 2,
              height: bubble.r * 2,
              borderRadius: bubble.r,
              backgroundColor: bubble.color,
              transform: [{ scale }],
              opacity,
            }}
          />
        );
      })}

      {isMobile ? (
        <Animated.View
          style={[
            styles.waveContainer,
            {
              transform: [
                { translateX: (tiltX || 0) * 10 },
                { translateY: (tiltY || 0) * 6 },
                { rotateX: `${tiltToDeg(tiltY || 0)}deg` },
                { rotateY: `${tiltToDeg(tiltX || 0)}deg` },
              ],
            },
          ]}
        >
          <WavesGPU width={width} height={220} intensity={16} speed={1} opacity={0.9} />
        </Animated.View>
      ) : (
        <View style={styles.waveContainer}>
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: wave1Color,
                transform: [
                  {
                    translateX: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [-width, width] }),
                  },
                  {
                    translateY: waveAnim1.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [anyFocused ? -14 : -10, anyFocused ? 14 : 10, anyFocused ? -14 : -10],
                    }),
                  },
                  { rotate: "-2deg" },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: wave2Color,
                top: 20,
                transform: [
                  { translateX: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [-width * 1.2, width * 0.8] }) },
                  {
                    translateY: waveAnim2.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [anyFocused ? 12 : 8, anyFocused ? -12 : -8, anyFocused ? 12 : 8],
                    }),
                  },
                  { rotate: "1.5deg" },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                backgroundColor: wave3Color,
                top: 40,
                transform: [
                  { translateX: waveAnim3.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.8, width * 1.2] }) },
                  {
                    translateY: waveAnim3.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [hasError ? -12 : -6, hasError ? 12 : 6, hasError ? -12 : -6],
                    }),
                  },
                  { rotate: "-1deg" },
                ],
              },
            ]}
          />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
        <View style={{ marginBottom: 20, alignItems: "center" }}>
          <Text style={styles.title}>Criar Conta</Text>
        </View>

        <GlassCard active={anyFocused || hasError} style={styles.formCard}>
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  transform: [
                    {
                      translateY: nameLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, -10] }),
                    },
                    { scale: nameLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
                  ],
                  opacity: nameLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >
              Nome Completo
            </Animated.Text>
            <TextInput
              key={`name-${formKey}`}
              style={[styles.input, nameError ? styles.inputError : undefined]}
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
            />
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  transform: [
                    {
                      translateY: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, -10] }),
                    },
                    { scale: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
                  ],
                  opacity: emailLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >
              Email
            </Animated.Text>
            <TextInput
              key={`email-${formKey}`}
              style={[styles.input, emailError ? styles.inputError : undefined]}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  transform: [
                    {
                      translateY: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, -10] }),
                    },
                    { scale: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
                  ],
                  opacity: passLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >
              Senha
            </Animated.Text>
            <View>
              <TextInput
                key={`password-${formKey}`}
                style={[styles.input, passError ? styles.inputError : undefined, { paddingRight: 44 }]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
              />
            </View>
            <View style={styles.strengthBarBg}>
              <View
                style={[
                  styles.strengthBarFill,
                  {
                    width: `${(passStrength / 4) * 100}%`,
                    backgroundColor: passStrength >= 3 ? "#22c55e" : passStrength === 2 ? "#f59e0b" : passStrength === 1 ? "#ef4444" : "#e5e7eb",
                  },
                ]}
              />
            </View>
            {!!passError && <Text style={styles.errorText}>{passError}</Text>}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.fieldContainer}>
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  transform: [
                    {
                      translateY: confirmPassLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, -10] }),
                    },
                    { scale: confirmPassLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
                  ],
                  opacity: confirmPassLabelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                },
              ]}
            >
              Confirmar Senha
            </Animated.Text>
            <View>
              <TextInput
                key={`confirm-password-${formKey}`}
                style={[styles.input, confirmPassError ? styles.inputError : undefined, { paddingRight: 44 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmPassFocused(true)}
                onBlur={() => setConfirmPassFocused(false)}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
              />
            </View>
            {!!confirmPassError && <Text style={styles.errorText}>{confirmPassError}</Text>}
          </View>

          {/* Sign Up Button */}
          <Animated.View
            style={{
              transform: [
                {
                  translateX: shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] }),
                },
              ],
              width: "100%",
            }}
          >
            <TouchableOpacity style={[styles.button, btnState === "success" ? styles.buttonSuccess : btnState === "error" ? styles.buttonError : undefined]} onPress={handleRegister}>
              {btnState === "loading" ? (
                <ActivityIndicator color="#fff" />
              ) : btnState === "success" ? (
                <Ionicons name="checkmark" size={20} color="#fff" />
              ) : btnState === "error" ? (
                <Ionicons name="alert" size={20} color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          {/* Login link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.signUpLink}>Faça login</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const cardShadow = Platform.OS === "web"
  ? { boxShadow: "0 8px 24px rgba(0,0,0,0.15)" as any }
  : { elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 };

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, zIndex: 10 },
  title: { fontSize: 36, fontWeight: "700", color: "#000", zIndex: 10 },
  fieldContainer: { width: "100%", marginBottom: 14, position: "relative" },
  floatingLabel: { position: "absolute", left: 16, top: 14, color: "#374151", fontWeight: "500", backgroundColor: "transparent" },
  formCard: { width: "100%", maxWidth: 380, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.9)", padding: 20, gap: 16, ...cardShadow },
  input: { width: "100%", height: 56, borderWidth: 1.5, borderColor: "#0a84ff", borderRadius: 12, marginBottom: 6, paddingHorizontal: 15, paddingTop: 18, paddingBottom: 10, fontSize: 16, color: "#000", backgroundColor: "rgba(255,255,255,0.98)" },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 6 },
  strengthBarBg: { width: "100%", height: 6, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginTop: 6 },
  strengthBarFill: { height: "100%", backgroundColor: "#e5e7eb", borderRadius: 4 },
  button: { width: "100%", height: 50, backgroundColor: "#000", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  buttonSuccess: { backgroundColor: "#16a34a" },
  buttonError: { backgroundColor: "#ef4444" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  waveContainer: { position: "absolute", top: height * 0.4, width: width, height: 220, zIndex: 1, overflow: "hidden" },
  wave: { position: "absolute", alignSelf: "center", width: width * 1.5, height: 140, borderRadius: 120 },
  // Sign up styles
  signUpContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 16,
    width: "100%"
  },
  signUpText: { 
    color: "#374151", 
    fontSize: 14 
  },
  signUpLink: { 
    color: "#0a84ff", 
    fontSize: 14, 
    fontWeight: "600",
    textDecorationLine: "underline"
  }
});