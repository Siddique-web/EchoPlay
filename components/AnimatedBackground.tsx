import { useAuth } from '@/contexts/AuthContext';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold, useFonts } from "@expo-google-fonts/montserrat";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from 'expo-local-authentication';
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

export default function HomeScreen({ onNavigateToSignUp }: { onNavigateToSignUp?: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

  const colorAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnims = useRef(BUBBLES.map(() => new Animated.Value(0))).current;
  // Animações das ondas
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passStrength, setPassStrength] = useState(0);
  const [btnState, setBtnState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [biometricBtnState, setBiometricBtnState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const emailLabelAnim = useRef(new Animated.Value(0)).current;
  const passLabelAnim = useRef(new Animated.Value(0)).current;

  // Check biometric support on component mount
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (enrolled) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Fingerprint');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else {
            setBiometricType('Biometric');
          }
        }
      }
    };
    
    checkBiometricSupport();
  }, []);

  // Garante que os campos iniciem vazios ao montar a tela
  useEffect(() => {
    setEmail("");
    setPassword("");
    if (Platform.OS === "web") {
      // Remonta os inputs para evitar autofill visual do navegador
      setFormKey((k) => k + 1);
      // Limpeza adicional após o navegador tentar autofill
      const t1 = setTimeout(() => {
        setEmail("");
        setPassword("");
      }, 50);
      const t2 = setTimeout(() => {
        setEmail("");
        setPassword("");
      }, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  // Cores fortes e contrastantes para o fundo
  // Azul carregado → Amarelo carregado → Branco → Verde fluorescente
  const colorSequence = ["#0d6efd", "#ffd029", "#ffffff", "#39ff14"];

  // Animação do fundo com transições suaves
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

    // loop contínuo para cada onda com defasagens de fase
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

  useEffect(() => {
    const to = emailFocused || email ? 1 : 0;
    Animated.timing(emailLabelAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [emailFocused, email]);

  useEffect(() => {
    const to = passFocused || password ? 1 : 0;
    Animated.timing(passLabelAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [passFocused, password]);

  const validateEmail = (v: string) => /^(?:[a-zA-Z0-9_'^&\/+\-]+(?:\.[a-zA-Z0-9_'^&\/+\-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(v);
  const calcPassStrength = (v: string) => {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[!@#$%^&*(),.?":{}|<>_+\-]/.test(v)) s++;
    if (/[A-Z]/.test(v)) s++;
    return Math.min(s, 4);
  };

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

  const hasError = !!emailError || !!passError;
  const anyFocused = emailFocused || passFocused;

  // Parallax/tilt (somente mobile)
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";
  const { tiltX, tiltY } = useParallaxTilt(isMobile);
  const tiltToDeg = (v: number) => v * 3; // até ~3 graus

  const backgroundColor = colorAnim.interpolate({
    inputRange: colorSequence.map((_, i) => i),
    outputRange: colorSequence,
  });

  // Overlay "respirando" para intensificar a cor atual de forma sutil e contínua
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

  if (!fontsLoaded) {
    // Show a simple title while fonts are loading
    return (
      <View style={[styles.container, { backgroundColor: '#0d6efd', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { color: '#fff' }]}>EchoPlay</Text>
      </View>
    );
  }

  const handleLogin = async () => {
    if (btnState === "loading") return;
    const invalid = !email || !password || hasError;
    if (invalid) {
      setBtnState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]).start();
      
      // Reset button state after 5 seconds
      setTimeout(() => {
        setBtnState("idle");
      }, 5000);
      
      return;
    }
    setBtnState("loading");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      console.log('Attempting login with credentials:', { email, password: '***' });
      await login(email, password);
      console.log('Login completed successfully');
      
      // Store credentials for biometric authentication
      await storeBiometricCredentials(email, password);
      
      setBtnState("success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to tabs screen after successful login
      setTimeout(() => {
        router.push('/(tab)/home');
      }, 1000);
    } catch (error: any) {
      console.error('Login failed with error:', error);
      setBtnState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]).start();
      
      // Reset button state after 5 seconds
      setTimeout(() => {
        setBtnState("idle");
      }, 5000);
      
      // Show error message to user
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      console.log('Setting error message:', errorMessage);
      setPassError(errorMessage);
    }
  };

  const handleBiometricAuth = async () => {
    if (biometricBtnState === "loading" || !isBiometricSupported) return;
    
    setBiometricBtnState("loading");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      // Check if we have stored credentials for this user
      const storedCredentials = await AsyncStorage.getItem('biometricCredentials');
      
      if (storedCredentials) {
        // Parse stored credentials
        const { email, password } = JSON.parse(storedCredentials);
        
        // Authenticate with biometrics
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Authenticate with ${biometricType || 'biometrics'}`,
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: true,
        });
        
        if (result.success) {
          // Login with stored credentials
          await login(email, password);
          setBiometricBtnState("success");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Navigate to tabs screen after successful login
          setTimeout(() => {
            router.push('/(tab)/home');
          }, 1000);
        } else {
          setBiometricBtnState("error");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          // Show error message to user
          setPassError("Biometric authentication failed");
          
          // Reset button state after 5 seconds
          setTimeout(() => {
            setBiometricBtnState("idle");
          }, 5000);
        }
      } else {
        // No stored credentials, prompt user to enable biometric auth
        setBiometricBtnState("error");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPassError("Biometric authentication not set up. Please login normally first.");
        
        // Reset button state after 5 seconds
        setTimeout(() => {
          setBiometricBtnState("idle");
        }, 5000);
      }
    } catch (error: any) {
      console.error('Biometric authentication failed with error:', error);
      setBiometricBtnState("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPassError("Biometric authentication failed");
      
      // Reset button state after 5 seconds
      setTimeout(() => {
        setBiometricBtnState("idle");
      }, 5000);
    }
  };

  // Function to store credentials for biometric authentication
  const storeBiometricCredentials = async (email: string, password: string) => {
    try {
      // Store credentials securely
      await AsyncStorage.setItem('biometricCredentials', JSON.stringify({ email, password }));
      console.log('Biometric credentials stored successfully');
    } catch (error) {
      console.error('Failed to store biometric credentials:', error);
    }
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Overlay que intensifica a cor atual com um "respiro" suave */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor, opacity: breatheOpacity }]} />
      {/* Plasma/ruído no fundo com parallax leve (mobile) */}
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
          {/* Fallback web: ondas JS */}
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
        <View style={{ marginBottom: 40, alignItems: "center" }}>
          <Text style={styles.title}>EchoPlay</Text>
        </View>

        <GlassCard active={anyFocused || hasError} style={styles.formCard}>
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
              autoComplete="off"
            />

            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
              />

              <TouchableOpacity style={styles.eye} onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#1f2937" />
              </TouchableOpacity>
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
            <TouchableOpacity style={[styles.button, btnState === "success" ? styles.buttonSuccess : btnState === "error" ? styles.buttonError : undefined]} onPress={handleLogin}>
              {btnState === "loading" ? (
                <ActivityIndicator color="#fff" />
              ) : btnState === "success" ? (
                <Ionicons name="checkmark" size={20} color="#fff" />
              ) : btnState === "error" ? (
                <Ionicons name="alert" size={20} color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          {/* Biometric Authentication Button */}
          {isBiometricSupported && (
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] }),
                  },
                ],
                width: "100%",
                marginTop: 10,
              }}
            >
              <TouchableOpacity 
                style={[styles.biometricButton, biometricBtnState === "success" ? styles.buttonSuccess : biometricBtnState === "error" ? styles.buttonError : undefined]} 
                onPress={handleBiometricAuth}
                disabled={biometricBtnState === "loading"}
              >
                {biometricBtnState === "loading" ? (
                  <ActivityIndicator color="#fff" />
                ) : biometricBtnState === "success" ? (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                ) : biometricBtnState === "error" ? (
                  <Ionicons name="alert" size={20} color="#fff" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="finger-print" size={20} color="#fff" />
                    <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                      {biometricType ? `Login with ${biometricType}` : 'Login with Biometrics'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Sign up link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={onNavigateToSignUp}>
              <Text style={styles.signUpLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const cardShadow = Platform.OS === "web"
  ? { boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }
  : { elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 };

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, zIndex: 10 },
  title: { fontSize: 36, fontWeight: "700", color: "#000", zIndex: 10 },
  fieldContainer: { width: "100%", marginBottom: 14, position: "relative" },
  floatingLabel: { position: "absolute", left: 16, top: 14, color: "#374151", fontWeight: "500", backgroundColor: "transparent", zIndex: 2 },
  formCard: { width: "100%", maxWidth: 380, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.9)", padding: 20, gap: 16, ...cardShadow },
  input: { width: "100%", height: 56, borderWidth: 1.5, borderColor: "#0a84ff", borderRadius: 12, marginBottom: 6, paddingHorizontal: 15, paddingTop: 18, paddingBottom: 10, fontSize: 16, color: "#000", backgroundColor: "rgba(255,255,255,0.98)", zIndex: 1 },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 6 },
  eye: { position: "absolute", right: 12, top: 18, height: 24, width: 24, alignItems: "center", justifyContent: "center" },
  strengthBarBg: { width: "100%", height: 6, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginTop: 6 },
  strengthBarFill: { height: "100%", backgroundColor: "#e5e7eb", borderRadius: 4 },
  button: { width: "100%", height: 50, backgroundColor: "#000", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  biometricButton: { width: "100%", height: 50, backgroundColor: "#0a84ff", borderRadius: 10, justifyContent: "center", alignItems: "center" },
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
