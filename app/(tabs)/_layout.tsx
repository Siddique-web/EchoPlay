import CustomDrawerContent from '@/components/CustomDrawerContent';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          drawerHideStatusBarOnOpen: true,
          drawerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#0E0E0E' : '#fff', // Match the home screen background
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          drawerType: 'slide',
        }}>
        <Drawer.Screen
          name="explore"
          options={{
            title: 'Explore',
            drawerIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        {user?.email === 'admin@gmail.com' && (
          <Drawer.Screen
            name="admin"
            options={{
              title: 'Admin',
              drawerIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
            }}
          />
        )}
        <Drawer.Screen
          name="immersive"
          options={{
            title: 'Experiências Imersivas',
            drawerIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
          }}
        />
        <Drawer.Screen
          name="scheduler"
          options={{
            title: 'Agenda',
            drawerIcon: ({ color }) => <IconSymbol size={28} name="alarm.fill" color={color} />,
          }}
        />
      </Drawer>
    </ProtectedRoute>
  );
}