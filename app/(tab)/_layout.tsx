import { Tabs } from 'expo-router';
import React from 'react';

import ProtectedRoute from '@/components/ProtectedRoute';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#0E0E0E' : '#0E0E0E', // Match the dark theme
            borderTopColor: colorScheme === 'dark' ? '#333' : '#333', // Match the dark theme
          },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Meu Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="folders"
          options={{
            title: 'Pastas',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
