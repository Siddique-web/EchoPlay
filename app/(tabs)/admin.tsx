import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Define types for file objects
interface FileInfo {
  uri: string;
  name?: string;
  fileName?: string;
  type?: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState<FileInfo | string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<FileInfo | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<FileInfo | null>(null);
  const [musicLoading, setMusicLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user) {
      setIsAdmin(user.email === 'admin@gmail.com');
    }
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.replace('/');
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
            setVideoThumbnail({uri: imageUri, name: file.name});
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
          setVideoThumbnail({uri: imageUri});
        }
      }
    } catch (error) {
      console.error('Error selecting video thumbnail:', error);
      Alert.alert('Erro', 'Falha ao selecionar a imagem.');
    }
  };

  // Add new video
  const handleAddVideo = async () => {
    if (!videoTitle || !videoDescription || (!selectedVideo && !videoUrl)) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setVideoLoading(true);
    
    try {
      // Prepare video data for API
      const thumbnailUri = videoThumbnail ? 
        (typeof videoThumbnail === 'string' ? videoThumbnail : videoThumbnail.uri) : 
        undefined;
      
      const videoData = {
        title: videoTitle,
        description: videoDescription,
        url: videoUrl || undefined,
        thumbnail: thumbnailUri
      };
      
      const result = await apiService.addVideo(videoData);
      
      if (result.success) {
        Alert.alert('Sucesso', 'Vídeo adicionado com sucesso!');
        
        // Clear form
        setVideoTitle('');
        setVideoDescription('');
        setVideoUrl('');
        setVideoThumbnail(null);
        setSelectedVideo(null);
      } else {
        Alert.alert('Erro', result.error || 'Falha ao adicionar o vídeo.');
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
    if (!musicTitle || !musicArtist || (!selectedMusic && !musicUrl)) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setMusicLoading(true);
    
    try {
      // Prepare music data for API
      const musicData = {
        title: musicTitle,
        artist: musicArtist,
        url: musicUrl || undefined
      };
      
      const result = await apiService.addMusic(musicData);
      
      if (result.success) {
        Alert.alert('Sucesso', 'Música adicionada com sucesso!');
        
        // Clear form
        setMusicTitle('');
        setMusicArtist('');
        setMusicUrl('');
        setSelectedMusic(null);
      } else {
        Alert.alert('Erro', result.error || 'Falha ao adicionar a música.');
      }
    } catch (error) {
      console.error('Error adding music:', error);
      Alert.alert('Erro', 'Falha ao adicionar a música. Verifique sua conexão e tente novamente.');
    } finally {
      setMusicLoading(false);
    }
  };

  // Add sample videos function
  const addSampleVideos = async () => {
    const sampleVideos = [
      {
        title: "Sunset Beach Vibes",
        description: "Relaxing beach footage with sunset colors and gentle waves",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"
      },
      {
        title: "Mountain Adventure",
        description: "Breathtaking mountain landscapes and hiking trails",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400"
      },
      {
        title: "City Night Lights",
        description: "Urban cityscape with beautiful night illumination",
        url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
        thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400"
      },
      {
        title: "Forest Exploration",
        description: "Peaceful walk through a lush green forest",
        url: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
        thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400"
      },
      {
        title: "Ocean Waves",
        description: "Calming ocean waves crashing on the shore",
        url: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_2mb.mp4",
        thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400"
      }
    ];

    Alert.alert(
      'Adicionar Vídeos de Exemplo',
      'Deseja adicionar 5 vídeos de exemplo? Isso ajudará os usuários a visualizar o conteúdo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async () => {
            setVideoLoading(true);
            try {
              // Add each sample video
              for (const video of sampleVideos) {
                const videoData = {
                  title: video.title,
                  description: video.description,
                  url: video.url,
                  thumbnail: video.thumbnail
                };

                const result = await apiService.addVideo(videoData);
                if (!result.success) {
                  throw new Error(result.error || 'Failed to add video');
                }
              }
              
              Alert.alert('Sucesso', '5 vídeos de exemplo foram adicionados com sucesso!');
            } catch (error) {
              console.error('Error adding sample videos:', error);
              Alert.alert('Erro', 'Falha ao adicionar vídeos de exemplo.');
            } finally {
              setVideoLoading(false);
            }
          }
        }
      ]
    );
  };

  // Add sample music function
  const addSampleMusic = async () => {
    const sampleMusic = [
      {
        title: "Summer Breeze",
        artist: "The Relaxation Collective",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      },
      {
        title: "Ocean Dreams",
        artist: "Nature Sounds",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
      },
      {
        title: "Mountain Echo",
        artist: "Outdoor Vibes",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
      },
      {
        title: "Forest Whispers",
        artist: "Natural Harmony",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
      },
      {
        title: "City Lights",
        artist: "Urban Beats",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
      }
    ];

    Alert.alert(
      'Adicionar Músicas de Exemplo',
      'Deseja adicionar 5 músicas de exemplo? Isso ajudará os usuários a visualizar o conteúdo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: async () => {
            setMusicLoading(true);
            try {
              // Add each sample music
              for (const music of sampleMusic) {
                const musicData = {
                  title: music.title,
                  artist: music.artist,
                  url: music.url
                };

                const result = await apiService.addMusic(musicData);
                if (!result.success) {
                  throw new Error(result.error || 'Failed to add music');
                }
              }
              
              Alert.alert('Sucesso', '5 músicas de exemplo foram adicionadas com sucesso!');
            } catch (error) {
              console.error('Error adding sample music:', error);
              Alert.alert('Erro', 'Falha ao adicionar músicas de exemplo.');
            } finally {
              setMusicLoading(false);
            }
          }
        }
      ]
    );
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
        {/* Add Sample Content Buttons */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.sampleButton, { backgroundColor: '#10b981' }]}
            onPress={addSampleVideos}
            disabled={videoLoading || musicLoading}
          >
            <Text style={styles.addButtonText}>
              {videoLoading ? 'Adicionando...' : 'Adicionar 5 Vídeos de Exemplo'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sampleButton, { backgroundColor: '#8b5cf6' }]}
            onPress={addSampleMusic}
            disabled={videoLoading || musicLoading}
          >
            <Text style={styles.addButtonText}>
              {musicLoading ? 'Adicionando...' : 'Adicionar 5 Músicas de Exemplo'}
            </Text>
          </TouchableOpacity>
        </View>

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
                <Image 
                  source={{ uri: typeof videoThumbnail === 'object' ? videoThumbnail.uri : videoThumbnail }} 
                  style={styles.thumbnail} 
                />
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
  sampleButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});