import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            router.replace('/');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Configurações</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Conta</Text>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => router.push('/profile')}
          >
            <IconSymbol size={24} name="person.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Informações do Perfil</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={handleLogout}
          >
            <IconSymbol size={24} name="arrow.right.square.fill" color="#ef4444" />
            <Text style={[styles.settingText, { color: '#ef4444' }]}>Sair</Text>
          </TouchableOpacity>
        </View>
        
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Notificações</Text>
          <View style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <IconSymbol size={24} name="bell.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Notificações</Text>
            <Switch
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>
        </View>
        
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Aparência</Text>
          <View style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <IconSymbol size={24} name="moon.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Modo Escuro</Text>
            <Switch
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              thumbColor={darkModeEnabled ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setDarkModeEnabled}
              value={darkModeEnabled}
            />
          </View>
        </View>
        
        {/* Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Privacidade</Text>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
          >
            <IconSymbol size={24} name="lock.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Privacidade</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
          >
            <IconSymbol size={24} name="shield.lefthalf.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Segurança</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>
        
        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Sobre</Text>
          <View style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <IconSymbol size={24} name="info.circle.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Versão</Text>
            <Text style={[styles.settingValue, { color: isDark ? '#ccc' : '#666' }]}>1.0.0</Text>
          </View>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
          >
            <IconSymbol size={24} name="doc.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Termos de Uso</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  settingValue: {
    fontSize: 16,
  },
});