import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

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
          
          // Check if biometric credentials are stored
          const storedCredentials = await AsyncStorage.getItem('biometricCredentials');
          setBiometricEnabled(!!storedCredentials);
        }
      }
    };
    
    checkBiometricSupport();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const navigateToScreen = (screen: string) => {
    router.push(`/(tabs)/${screen}` as any);
  };

  const toggleBiometricAuth = async (value: boolean) => {
    if (value) {
      // Enable biometric authentication
      try {
        // Check if we have stored credentials
        const storedCredentials = await AsyncStorage.getItem('biometricCredentials');
        if (!storedCredentials) {
          Alert.alert(
            'Biometric Authentication',
            'To enable biometric authentication, please login normally first. Your credentials will be securely stored for future biometric logins.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Test biometric authentication
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Authenticate with ${biometricType || 'biometrics'}`,
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: true,
        });
        
        if (result.success) {
          setBiometricEnabled(true);
          Alert.alert('Success', 'Biometric authentication enabled successfully');
        } else {
          Alert.alert('Error', 'Failed to authenticate. Biometric authentication not enabled.');
        }
      } catch (error) {
        console.error('Error enabling biometric auth:', error);
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      // Disable biometric authentication
      try {
        await AsyncStorage.removeItem('biometricCredentials');
        setBiometricEnabled(false);
        Alert.alert('Success', 'Biometric authentication disabled successfully');
      } catch (error) {
        console.error('Error disabling biometric auth:', error);
        Alert.alert('Error', 'Failed to disable biometric authentication');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Configurações</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>Geral</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => navigateToScreen('settings')}
          >
            <IconSymbol size={24} name="gearshape.fill" color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Configurações Gerais</Text>
            <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => navigateToScreen('settings')}
          >
            <IconSymbol size={24} name="bell.fill" color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Notificações</Text>
            <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => navigateToScreen('settings')}
          >
            <IconSymbol size={24} name="lock.fill" color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Privacidade</Text>
            <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        {isBiometricSupported && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>Segurança</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
              <IconSymbol size={24} name="touchid" color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>
                {biometricType ? `Login com ${biometricType}` : 'Login com Biometria'}
              </Text>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometricAuth}
                trackColor={{ false: isDark ? '#767577' : '#ccc', true: '#0a84ff' }}
                thumbColor={biometricEnabled ? '#fff' : isDark ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
          </View>
        )}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>Conta</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => router.push('/(tab)/profile')}
          >
            <IconSymbol size={24} name="person.fill" color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Meu Perfil</Text>
            <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
          </TouchableOpacity>
          
          {user?.email === 'admin@gmail.com' && (
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
              onPress={() => router.push('/(tabs)/admin')}
            >
              <IconSymbol size={24} name="gearshape.fill" color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Administração</Text>
              <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
            </TouchableOpacity>
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>Aplicativo</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => router.push('/immersive')}
          >
            <IconSymbol size={24} name="sparkles" color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Experiências Imersivas</Text>
            <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => router.push('/(tabs)/scheduler')}
          >
            <IconSymbol size={24} name="alarm.fill" color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Agenda</Text>
            <IconSymbol size={20} name="chevron.right" color="#0a84ff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { borderTopColor: isDark ? '#333' : '#e0e0e0' }]}
        onPress={handleLogout}
      >
        <IconSymbol size={24} name="chevron.right" color="#ef4444" />
        <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sair</Text>
      </TouchableOpacity>
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});