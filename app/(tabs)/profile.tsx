import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { uploadProfileImage } from '@/utils/db/database';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // If user is not logged in, redirect to login screen
      router.replace('/');
    } else {
      // Update profile image when user changes
      // Use the user's profile_image from the database
      setProfileImage(user.profile_image || null);
    }
  }, [user, router]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    // After refreshing, update the profile image
    const currentUser = await getCurrentUserFromContext();
    if (currentUser) {
      setProfileImage(currentUser.profile_image || null);
    }
    setRefreshing(false);
  };

  // Helper function to get current user
  const getCurrentUserFromContext = async () => {
    // In a real implementation, you might want to fetch fresh user data
    // For now, we'll just return the current user from context
    return user;
  };

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
              router.replace('/'); // Navigate back to login
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const selectProfileImageFromDevice = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            try {
              setLoading(true);
              // Create a local URL for the file
              const imageUri = URL.createObjectURL(file);
              await uploadProfileImage(imageUri);
              setProfileImage(imageUri);
              Alert.alert('Sucesso', 'Foto de perfil atualizada!');
            } catch (error) {
              console.error('Error uploading profile image:', error);
              Alert.alert('Erro', 'Falha ao atualizar a foto de perfil.');
            } finally {
              setLoading(false);
            }
          }
        };
        
        input.click();
      } else {
        // For mobile, use image picker to select from device
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
        
        if (!result.canceled) {
          setLoading(true);
          const imageUri = result.assets[0].uri;
          await uploadProfileImage(imageUri);
          setProfileImage(imageUri);
          Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        }
      }
    } catch (error) {
      console.error('Error selecting profile image:', error);
      Alert.alert('Erro', 'Falha ao selecionar a foto de perfil.');
      setLoading(false);
    }
  };

  const takeProfilePhoto = async () => {
    try {
      // Request permission to access camera
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.granted === false) {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua câmera.');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setLoading(true);
        // Upload the image
        const imageUri = result.assets[0].uri;
        await uploadProfileImage(imageUri);
        setProfileImage(imageUri);
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error) {
      console.error('Error taking profile photo:', error);
      Alert.alert('Erro', 'Falha ao tirar a foto de perfil.');
    } finally {
      setLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    const options = [
      {
        text: 'Tirar Foto',
        onPress: takeProfilePhoto,
      },
      {
        text: Platform.OS === 'web' ? 'Escolher do Computador' : 'Escolher da Galeria',
        onPress: selectProfileImageFromDevice,
      },
      {
        text: 'Remover Foto',
        onPress: async () => {
          try {
            setProfileImage(null);
            // Also update on the server
            await uploadProfileImage(''); // Empty string to remove
            Alert.alert('Sucesso', 'Foto de perfil removida!');
          } catch (error) {
            console.error('Error removing profile image:', error);
            Alert.alert('Erro', 'Falha ao remover a foto de perfil.');
          }
        },
        style: 'destructive' as const,
      },
      {
        text: 'Cancelar',
        style: 'cancel' as const,
      },
    ];
    
    // On web, camera might not be available
    if (Platform.OS === 'web') {
      // Remove "Tirar Foto" option for web
      options.splice(0, 1);
    }
    
    Alert.alert(
      'Foto de Perfil',
      'Escolha uma opção',
      options
    );
  };

  // Add a new function to directly select from gallery
  const selectFromGallery = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            try {
              setLoading(true);
              // Create a local URL for the file
              const imageUri = URL.createObjectURL(file);
              await uploadProfileImage(imageUri);
              setProfileImage(imageUri);
              Alert.alert('Sucesso', 'Foto de perfil atualizada!');
            } catch (error) {
              console.error('Error uploading profile image:', error);
              Alert.alert('Erro', 'Falha ao atualizar a foto de perfil.');
            } finally {
              setLoading(false);
            }
          }
        };
        
        input.click();
      } else {
        // For mobile, use image picker to select from device gallery
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
        
        if (!result.canceled) {
          setLoading(true);
          const imageUri = result.assets[0].uri;
          await uploadProfileImage(imageUri);
          setProfileImage(imageUri);
          Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        }
      }
    } catch (error) {
      console.error('Error selecting profile image:', error);
      Alert.alert('Erro', 'Falha ao selecionar a foto de perfil.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/home')} style={styles.menuButton}>
          <IconSymbol size={28} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={showImagePickerOptions} disabled={loading}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <IconSymbol size={20} name="person.fill" color="#666" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.userName, { color: isDark ? '#fff' : '#000' }]}>{user?.name || 'Usuário'}</Text>
        </View>
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Informações do Perfil</Text>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.infoLabel, { color: isDark ? '#ccc' : '#666' }]}>Nome:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000' }]}>{user?.name || 'Não informado'}</Text>
          </View>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.infoLabel, { color: isDark ? '#ccc' : '#666' }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000' }]}>{user?.email || 'Não informado'}</Text>
          </View>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.infoLabel, { color: isDark ? '#ccc' : '#666' }]}>Membro desde:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#000' }]}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Configurações</Text>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={showImagePickerOptions}
          >
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Foto de Perfil</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={selectFromGallery}
          >
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Escolher da Galeria</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => router.push('/settings')}
          >
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Configurações Gerais</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Notificações</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Privacidade</Text>
            <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
            <Text style={[styles.settingText, { color: isDark ? '#fff' : '#000' }]}>Ajuda</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
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
  },
});