import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  userName: string;
  onMenuPress: () => void;
  onLogoutPress: () => void;
}

export default function ProfileHeader({ userName, onMenuPress, onLogoutPress }: ProfileHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <IconSymbol size={28} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
      </TouchableOpacity>
      
      <View style={styles.profileInfo}>
        <View style={styles.profileImagePlaceholder} />
        <Text style={[styles.userName, { color: isDark ? '#fff' : '#000' }]}>{userName}</Text>
      </View>
      
      <TouchableOpacity onPress={onLogoutPress} style={styles.logoutButton}>
        <Text style={[styles.logoutText, { color: Colors[colorScheme ?? 'light'].tint }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 5,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});