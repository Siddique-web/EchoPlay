import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/index', '/modal', '/network-diagnostics']; // Only login page and some special routes are public
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Handle redirects with useEffect to avoid setState during render
  useEffect(() => {
    if (loading) return;
    
    // If user is not authenticated and trying to access a protected route, redirect to login
    if (!user && !isPublicRoute) {
      router.replace('/');
      setChecked(true);
      return;
    }

    // If user is authenticated and trying to access login page, redirect to home
    if (user && (pathname === '/' || pathname === '/index')) {
      router.replace('/(tab)/home');
      setChecked(true);
      return;
    }
    
    setChecked(true);
  }, [user, loading, pathname, isPublicRoute, router]);

  if (loading || !checked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  // If user is not authenticated and trying to access a protected route, redirect to login
  if (!user && !isPublicRoute) {
    router.replace('/');
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});