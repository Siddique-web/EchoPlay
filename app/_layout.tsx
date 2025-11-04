import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [initError, setInitError] = useState<string | null>(null);
  
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
        setInitError(error.message || 'Failed to initialize app');
        // Proceed anyway after a short delay to avoid blocking the UI
        setTimeout(() => {
          setAppReady(true);
        }, 2000);
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

  // Show error screen if initialization failed
  if (initError && !appReady) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setInitError(null);
            setAppReady(false);
            // Re-trigger initialization
            setTimeout(() => {
              setAppReady(true);
            }, 1000);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Don't render the app until it's ready
  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando aplicativo...</Text>
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
            <Stack.Screen name="network-diagnostics" options={{ title: 'Network Diagnostics' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </MusicProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10
  },
  errorText: {
    fontSize: 16,
    color: 'darkred',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});