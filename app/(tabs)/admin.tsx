import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AdminScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // State for video form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{uri: string, name: string} | null>(null); // For actual video file
  
  // State for music form
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<{uri: string, name: string} | null>(null); // For actual music file
  
  // Loading states
  const [videoLoading, setVideoLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'admin@gmail.com';

  // Handle logout
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

  // Select video file from device
  const selectVideoFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            // Create a local URL for the file
            const fileUri = URL.createObjectURL(file);
            setSelectedVideo({uri: fileUri, name: file.name});
            // Also set the URL field for display
            setVideoUrl(file.name);
          }
        };
        
        input.click();
      } else {
        // For mobile, use image picker to select video from gallery
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar seus vídeos.');
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          quality: 0.8,
        });
        
        if (!result.canceled) {
          const videoAsset = result.assets[0];
          setSelectedVideo({uri: videoAsset.uri, name: videoAsset.fileName || 'video'});
          // Also set the URL field for display
          setVideoUrl(videoAsset.fileName || 'video');
        }
      }
    } catch (error) {
      console.error('Error selecting video file:', error);
      Alert.alert('Erro', 'Falha ao selecionar o vídeo.');
    }
  };

  // Select music file from device
  const selectMusicFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            // Create a local URL for the file
            const fileUri = URL.createObjectURL(file);
            setSelectedMusic({uri: fileUri, name: file.name});
            // Also set the URL field for display
            setMusicUrl(file.name);
          }
        };
        
        input.click();
      } else {
        // For mobile, use document picker to select music from device (since ImagePicker doesn't support audio)
        const result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
          copyToCacheDirectory: true,
        });
        
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const musicAsset = result.assets[0];
          setSelectedMusic({uri: musicAsset.uri, name: musicAsset.name || 'music'});
          // Also set the URL field for display
          setMusicUrl(musicAsset.name || 'music');
        }
      }
    } catch (error) {
      console.error('Error selecting music file:', error);
      Alert.alert('Erro', 'Falha ao selecionar a música.');
    }
  };

  // Select video thumbnail
  const selectVideoThumbnail = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            // Create a local URL for the file
            const imageUri = URL.createObjectURL(file);
            setVideoThumbnail(imageUri);
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
          aspect: [16, 9],
          quality: 0.5,
        });
        
        if (!result.canceled) {
          const imageUri = result.assets[0].uri;
          setVideoThumbnail(imageUri);
        }
      }
    } catch (error) {
      console.error('Error selecting video thumbnail:', error);
      Alert.alert('Erro', 'Falha ao selecionar a imagem.');
    }
  };

  // Add new video
  const handleAddVideo = async () => {
    if (!videoTitle || !selectedVideo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setVideoLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('description', videoDescription || '');
      
      // Append video file if selected
      if (selectedVideo) {
        const fileName = selectedVideo.name || 'video.mp4';
        const fileExtension = fileName.split('.').pop() || 'mp4';
        
        // For web, we need to handle the blob URL differently
        if (Platform.OS === 'web' && selectedVideo.uri.startsWith('blob:')) {
          // For web blob URLs, we'll need to fetch the blob and append it
          const response = await fetch(selectedVideo.uri);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });
          formData.append('video', file);
        } else {
          // For mobile or direct file URLs
          formData.append('video', {
            uri: selectedVideo.uri,
            type: `video/${fileExtension}`,
            name: fileName,
          } as any);
        }
      }
      
      // Append thumbnail if selected
      if (videoThumbnail) {
        const thumbnailName = 'thumbnail.jpg';
        
        if (Platform.OS === 'web' && videoThumbnail.startsWith('blob:')) {
          const response = await fetch(videoThumbnail);
          const blob = await response.blob();
          const file = new File([blob], thumbnailName, { type: 'image/jpeg' });
          formData.append('thumbnail', file);
        } else {
          formData.append('thumbnail', {
            uri: videoThumbnail,
            type: 'image/jpeg',
            name: thumbnailName,
          } as any);
        }
      }
      
      // Use direct fetch for file upload since our API service doesn't handle FormData well
      const token = apiService.getToken();
      const response = await fetch('http://192.168.18.93:5000/api/videos', {
        method: 'POST',
        headers: {
          'x-access-token': token || '',
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Vídeo adicionado com sucesso!');
        
        // Clear form
        setVideoTitle('');
        setVideoDescription('');
        setVideoUrl('');
        setVideoThumbnail(null);
        setSelectedVideo(null);
      } else {
        Alert.alert('Erro', result.message || 'Falha ao adicionar o vídeo.');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Erro', 'Falha ao adicionar o vídeo. Verifique sua conexão e tente novamente.');
    } finally {
      setVideoLoading(false);
    }
  };

  // Add new music
  const handleAddMusic = async () => {
    if (!musicTitle || !musicArtist || !selectedMusic) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setMusicLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', musicTitle);
      formData.append('artist', musicArtist);
      
      // Append music file if selected
      if (selectedMusic) {
        const fileName = selectedMusic.name || 'music.mp3';
        const fileExtension = fileName.split('.').pop() || 'mp3';
        
        // For web, we need to handle the blob URL differently
        if (Platform.OS === 'web' && selectedMusic.uri.startsWith('blob:')) {
          // For web blob URLs, we'll need to fetch the blob and append it
          const response = await fetch(selectedMusic.uri);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });
          formData.append('music', file);
        } else {
          // For mobile or direct file URLs
          formData.append('music', {
            uri: selectedMusic.uri,
            type: `audio/${fileExtension}`,
            name: fileName,
          } as any);
        }
      }
      
      // Use direct fetch for file upload since our API service doesn't handle FormData well
      const token = apiService.getToken();
      const response = await fetch('http://192.168.18.93:5000/api/music', {
        method: 'POST',
        headers: {
          'x-access-token': token || '',
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        Alert.alert('Sucesso', 'Música adicionada com sucesso!');
        
        // Clear form
        setMusicTitle('');
        setMusicArtist('');
        setMusicUrl('');
        setSelectedMusic(null);
      } else {
        Alert.alert('Erro', result.message || 'Falha ao adicionar a música.');
      }
    } catch (error) {
      console.error('Error adding music:', error);
      Alert.alert('Erro', 'Falha ao adicionar a música. Verifique sua conexão e tente novamente.');
    } finally {
      setMusicLoading(false);
    }
  };

  // If user is not admin, redirect to home
  if (!isAdmin) {
    router.replace('/(tabs)/home');
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/home')} style={styles.backButton}>
          <IconSymbol size={28} name="chevron.left" color="#0a84ff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Administração</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Video Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Gerenciar Vídeos</Text>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Título *</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#333' : '#fff' }]}
              value={videoTitle}
              onChangeText={setVideoTitle}
              placeholder="Digite o título do vídeo"
              placeholderTextColor={isDark ? '#888' : '#999'}
            />
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Selecionar Vídeo *</Text>
            <TouchableOpacity 
              style={[styles.fileSelectButton, { backgroundColor: isDark ? '#333' : '#eee' }]}
              onPress={selectVideoFile}
            >
              <Text style={[styles.fileSelectText, { color: isDark ? '#ccc' : '#666' }]}>
                {selectedVideo ? selectedVideo.name : 'Toque para selecionar um vídeo'}
              </Text>
            </TouchableOpacity>
            {selectedVideo && (
              <Text style={[styles.selectedFileText, { color: isDark ? '#888' : '#999' }]}>
                Vídeo selecionado: {selectedVideo.name}
              </Text>
            )}
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Descrição</Text>
            <TextInput
              style={[styles.textArea, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#333' : '#fff' }]}
              value={videoDescription}
              onChangeText={setVideoDescription}
              placeholder="Digite a descrição do vídeo"
              placeholderTextColor={isDark ? '#888' : '#999'}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Thumbnail</Text>
            <TouchableOpacity 
              style={[styles.thumbnailContainer, { backgroundColor: isDark ? '#333' : '#eee' }]}
              onPress={selectVideoThumbnail}
            >
              {videoThumbnail ? (
                <Image source={{ uri: videoThumbnail }} style={styles.thumbnail} />
              ) : (
                <Text style={[styles.thumbnailText, { color: isDark ? '#ccc' : '#666' }]}>
                  Toque para selecionar uma imagem
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#0a84ff' }]}
            onPress={handleAddVideo}
            disabled={videoLoading}
          >
            <Text style={styles.addButtonText}>
              {videoLoading ? 'Adicionando...' : 'Adicionar Vídeo'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Music Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Gerenciar Músicas</Text>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Título *</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#333' : '#fff' }]}
              value={musicTitle}
              onChangeText={setMusicTitle}
              placeholder="Digite o título da música"
              placeholderTextColor={isDark ? '#888' : '#999'}
            />
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Artista *</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#333' : '#fff' }]}
              value={musicArtist}
              onChangeText={setMusicArtist}
              placeholder="Digite o nome do artista"
              placeholderTextColor={isDark ? '#888' : '#999'}
            />
          </View>
          
          <View style={[styles.formGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>Selecionar Música *</Text>
            <TouchableOpacity 
              style={[styles.fileSelectButton, { backgroundColor: isDark ? '#333' : '#eee' }]}
              onPress={selectMusicFile}
            >
              <Text style={[styles.fileSelectText, { color: isDark ? '#ccc' : '#666' }]}>
                {selectedMusic ? selectedMusic.name : 'Toque para selecionar uma música'}
              </Text>
            </TouchableOpacity>
            {selectedMusic && (
              <Text style={[styles.selectedFileText, { color: isDark ? '#888' : '#999' }]}>
                Música selecionada: {selectedMusic.name}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#0a84ff' }]}
            onPress={handleAddMusic}
            disabled={musicLoading}
          >
            <Text style={styles.addButtonText}>
              {musicLoading ? 'Adicionando...' : 'Adicionar Música'}
            </Text>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
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
  formGroup: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 80,
  },
  fileSelectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  fileSelectText: {
    fontSize: 16,
  },
  selectedFileText: {
    fontSize: 14,
    marginTop: 5,
  },
  thumbnailContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  thumbnailText: {
    fontSize: 16,
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});