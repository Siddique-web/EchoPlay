import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../contexts/AuthContext';
import { MusicProvider } from '../contexts/MusicContext';
import { initDB } from '../utils/db/database';

export const unstable_settings = {
  anchor: '(tab)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Initialize the app
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        // Initialize database with in-memory storage
        await initDB();
        setAppReady(true);
        console.log('App initialized successfully');
      } catch (error: any) {
        console.warn('App initialization failed:', error);
        // Proceed anyway
        setAppReady(true);
      }
    };
    
    // Add a timeout to ensure the app loads
    const timeout = setTimeout(() => {
      if (!appReady) {
        console.log('App initialization timeout, proceeding anyway');
        setAppReady(true);
      }
    }, 5000); // 5 second timeout
    
    initializeApp();
    
    const origWarn = console.warn;
    console.warn = (...args: any[]) => {
      const msg = String(args[0] ?? '');
      // Suppress known deprecation warnings
      if (msg.includes('props.pointerEvents is deprecated')) return;
      if (msg.includes('View.propTypes')) return;
      origWarn(...args);
    };
    
    return () => {
      console.warn = origWarn;
      clearTimeout(timeout);
    };
  }, []);

  // Don't render the app until it's ready
  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Carregando aplicativo...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <MusicProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tab)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="immersive" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </MusicProvider>
    </AuthProvider>
  );
}