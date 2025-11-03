import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileImage(user.profile_image || null);
    }
  }, [user]);

  const handleLogout = () => {
    // In a real app, you would clear the user session here
    props.navigation.closeDrawer();
    // Navigate to login screen (index route)
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'index' }],
    });
  };

  const navigateToSettings = () => {
    props.navigation.closeDrawer();
    router.push('/settings');
  };

  const navigateToAdmin = () => {
    props.navigation.closeDrawer();
    router.push('/(tabs)/admin');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <DrawerContentScrollView {...props}>
        {/* User Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <TouchableOpacity onPress={() => {
            props.navigation.closeDrawer();
            props.navigation.navigate('(tab)', { screen: 'profile' });
          }}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: isDark ? '#fff' : '#000' }]}>
            {user?.name || 'Usuário'}
          </Text>
          <Text style={[styles.profileEmail, { color: isDark ? '#ccc' : '#666' }]}>
            {user?.email || 'email@exemplo.com'}
          </Text>
        </View>
        
        {/* Main Navigation Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>Navegação</Text>
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('(tab)', { screen: 'home' });
            }}
          >
            <IconSymbol size={24} name="house.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.drawerItemText, { color: isDark ? '#fff' : '#000' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate('explore');
            }}
          >
            <IconSymbol size={24} name="paperplane.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.drawerItemText, { color: isDark ? '#fff' : '#000' }]}>Explore</Text>
          </TouchableOpacity>
          {user?.email === 'admin@gmail.com' && (
            <TouchableOpacity 
              style={styles.drawerItem}
              onPress={navigateToAdmin}
            >
              <IconSymbol size={24} name="gearshape.fill" color={Colors[colorScheme ?? 'light'].tint} />
              <Text style={[styles.drawerItemText, { color: isDark ? '#fff' : '#000' }]}>Administração</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#666' }]}>Configurações</Text>
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={navigateToSettings}
          >
            <IconSymbol size={24} name="gearshape.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.drawerItemText, { color: isDark ? '#fff' : '#000' }]}>Configurações Gerais</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={navigateToSettings}
          >
            <IconSymbol size={24} name="bell.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.drawerItemText, { color: isDark ? '#fff' : '#000' }]}>Notificações</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={navigateToSettings}
          >
            <IconSymbol size={24} name="lock.fill" color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={[styles.drawerItemText, { color: isDark ? '#fff' : '#000' }]}>Privacidade</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <IconSymbol size={24} name="chevron.right" color="#ef4444" />
        <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const Colors = {
  light: { tint: '#0a84ff' },
  dark: { tint: '#0a84ff' }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    alignSelf: 'center',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    marginBottom: 15,
    alignSelf: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    textTransform: 'uppercase',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
});