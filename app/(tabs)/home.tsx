import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Video image placeholder
const videoImage = require('../../assets/images/react-logo.png');

// Categories for filtering content
const categories = ['All', 'Music', 'Videos', 'Favoritos'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { 
    currentMusic, 
    isPlaying, 
    setIsPlaying, 
    sendPlaybackCommand 
  } = useMusic();
  
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [musics, setMusics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFolderOptions, setShowFolderOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Load videos and music
  const loadContent = async () => {
    setLoading(true);
    
    try {
      // Fetch videos from API
      const videoResponse = await apiService.getVideos();
      if (videoResponse.success) {
        // Format videos and reverse order to show most recent first (left to right)
        const formattedVideos = videoResponse.videos.map((video: any) => ({
          id: video.id?.toString() || Math.random().toString(),
          title: video.title || 'Untitled Video',
          description: video.description || '',
          url: video.url || '',
          image: video.thumbnail ? { uri: video.thumbnail } : videoImage,
        }))
        .filter((video: any) => video.url) // Filter out videos without URLs
        .reverse(); // Reverse to show most recent first
        setVideos(formattedVideos);
      } else {
        // No videos available
        setVideos([]);
      }
      
      // Fetch music from API
      const musicResponse = await apiService.getMusic();
      if (musicResponse.success) {
        // Format music and sort by most recent first (top to bottom)
        const formattedMusics = musicResponse.music.map((music: any) => ({
          id: music.id?.toString() || Math.random().toString(),
          title: music.title || 'Untitled Music',
          artist: music.artist || 'Unknown Artist',
          url: music.url || '',
          created_at: music.created_at || new Date().toISOString(),
        }))
        .filter((music: any) => music.url) // Filter out music without URLs
        .sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ); // Sort by most recent first
        setMusics(formattedMusics);
      } else {
        // No music available
        setMusics([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      // No content available
      setVideos([]);
      setMusics([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh content when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [])
  );

  const getSampleVideos = () => [
    // Empty array - no sample videos
  ];

  const getSampleMusics = () => [
    // Empty array - no sample music
  ];

  // Render item for music list
  const renderMusicItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.musicItem}
      onPress={() => {
        // Navigate to music player screen
        router.push({
          pathname: '/(tabs)/music-player',
          params: { music: JSON.stringify(item) }
        });
      }}
    >
      <View style={styles.musicInfo}>
        <Text style={styles.musicTitle}>{item.title}</Text>
        {item.artist && <Text style={styles.musicArtist}>{item.artist}</Text>}
      </View>
      <Ionicons name="play" size={20} color="#0a84ff" />
    </TouchableOpacity>
  );

  // Render video item
  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.videoCard}
      onPress={() => {
        // Navigate to video player screen
        router.push({
          pathname: '/(tabs)/video-player',
          params: { video: JSON.stringify(item) }
        });
      }}
    >
      <Image source={item.image} style={styles.videoImage} />
      <Text style={styles.videoTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Filter music based on search query
  const filteredMusics = musics.filter(music => 
    music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (music.artist && music.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter content based on selected category
  const filterContent = () => {
    switch (selectedCategory) {
      case 'Music':
        return { videos: [], musics: filteredMusics };
      case 'Videos':
        return { videos: videos, musics: [] };
      case 'Favoritos':
        // TODO: Implement favorites filtering
        // For now, return all content as favorites functionality isn't implemented yet
        return { videos: videos, musics: filteredMusics };
      case 'All':
      default:
        return { videos: videos, musics: filteredMusics };
    }
  };

  const { videos: filteredVideos, musics: filteredMusicsByCategory } = filterContent();

  // Toggle playback for currently playing music
  const togglePlayback = () => {
    if (!currentMusic) return;
    
    // Send toggle command to music player
    sendPlaybackCommand('toggle');
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0E0E0E" }]}>
      {/* 🔵 HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {isSearching ? (
          // Search input header
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              onPress={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
              style={styles.searchBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFD700" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar músicas..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Normal header
          <View style={styles.leftHeader}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <IconSymbol name="line.3.horizontal" size={24} color="#FFD700" />
            </TouchableOpacity>
            <Text style={styles.logo}>EchoPlay</Text>
          </View>
        )}
        
        {!isSearching && (
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowFolderOptions(true)}>
              <Ionicons name="add" size={22} color="#FFD700" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSearching(true)}>
              <Ionicons name="search" size={22} color="#FFD700" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/immersive' as any)}>
              <Ionicons name="sparkles" size={22} color="#FFD700" style={styles.icon} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Folder Options Modal */}
      {showFolderOptions && (
        <View style={styles.modalOverlay}>
          <View style={[styles.folderOptionsModal, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Criar Pasta Personalizada
            </Text>
            <Text style={[styles.modalSubtitle, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Escolha o tipo de pasta que deseja criar
            </Text>
            
            <TouchableOpacity 
              style={[styles.folderOption, { backgroundColor: '#0a84ff' }]}
              onPress={() => {
                setShowFolderOptions(false);
                // TODO: Implement music folder creation
                alert('Funcionalidade de criação de pasta de música será implementada');
              }}
            >
              <Ionicons name="musical-notes" size={24} color="#fff" />
              <Text style={styles.folderOptionText}>Pasta de Músicas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.folderOption, { backgroundColor: '#4CAF50' }]}
              onPress={() => {
                setShowFolderOptions(false);
                // TODO: Implement video folder creation
                alert('Funcionalidade de criação de pasta de vídeos será implementada');
              }}
            >
              <Ionicons name="videocam" size={24} color="#fff" />
              <Text style={styles.folderOptionText}>Pasta de Vídeos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.folderOption, { backgroundColor: '#9C27B0' }]}
              onPress={() => {
                setShowFolderOptions(false);
                router.push('/(tabs)/scheduler');
              }}
            >
              <Ionicons name="alarm" size={24} color="#fff" />
              <Text style={styles.folderOptionText}>Agenda de Músicas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colorScheme === 'dark' ? '#555' : '#eee' }]}
              onPress={() => setShowFolderOptions(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main content with scroll view */}
      <ScrollView style={styles.content}>
        {/* 🔴 CATEGORY TABS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[
                styles.tabButton,
                selectedCategory === cat && styles.selectedTabButton
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.tabText,
                selectedCategory === cat && styles.selectedTabText
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🟢 VIDEO CAROUSEL */}
        {(selectedCategory === 'All' || selectedCategory === 'Videos' || selectedCategory === 'Favoritos') && (
          <>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Recommended Videos</Text>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Carregando vídeos...</Text>
            ) : filteredVideos.length > 0 ? (
              <FlatList
                data={filteredVideos}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoItem}
                contentContainerStyle={styles.videoList}
              />
            ) : (
              <Text style={styles.loadingText}>No videos available. Upload videos to see them here.</Text>
            )}
          </>
        )}

        {/* ⚪ MUSIC LIST */}
        {(selectedCategory === 'All' || selectedCategory === 'Music' || selectedCategory === 'Favoritos') && (
          <>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Latest Music</Text>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Carregando músicas...</Text>
            ) : filteredMusicsByCategory.length > 0 ? (
              <FlatList
                data={filteredMusicsByCategory}
                keyExtractor={(item) => item.id}
                renderItem={renderMusicItem}
                style={styles.musicList}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.loadingText}>No music available. Upload music to see it here.</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* 🟠 NOW PLAYING BAR - Always visible */}
      <View style={styles.nowPlaying}>
        {currentMusic ? (
          <>
            <View>
              <Text style={styles.nowTitle} numberOfLines={1}>{currentMusic.title}</Text>
              <Text style={styles.nowArtist} numberOfLines={1}>By: {currentMusic.artist}</Text>
            </View>
            <View style={styles.nowControls}>
              <Ionicons name="play-skip-back" size={20} color="#fff" />
              <TouchableOpacity onPress={togglePlayback}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="play-skip-forward" size={20} color="#fff" />
            </View>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.nowTitle}>No music playing</Text>
              <Text style={styles.nowArtist}>Select a song to play</Text>
            </View>
            <View style={styles.nowControls}>
              <Ionicons name="play-skip-back" size={20} color="#fff" />
              <Ionicons name="play" size={24} color="#fff" />
              <Ionicons name="play-skip-forward" size={20} color="#fff" />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0E0E0E" 
  },
  content: {
    flex: 1,
    marginBottom: 80, // Space for now playing bar
  },

  // 🔵 HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#0E0E0E",
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 5,
  },
  logo: { 
    color: "#FFD700", 
    fontSize: 22, 
    fontWeight: "bold", 
    marginLeft: 8, // Reduced spacing to make it closer to the menu button
  },
  headerIcons: { 
    flexDirection: "row" 
  },
  icon: { 
    marginLeft: 15 
  },
  searchHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBackButton: {
    padding: 5,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: "#fff",
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 5,
    marginLeft: 10,
  },

  // Folder Options Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  folderOptionsModal: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  folderOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // SECTION TITLE
  sectionTitleContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },

  // 🔴 CATEGORY TABS
  tabs: { 
    marginVertical: 10, 
    marginLeft: 15 
  },
  tabButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 15,
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFD700",
  },
  tabText: { 
    color: "#ccc", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  selectedTabText: {
    color: "#FFD700",
  },

  // 🟢 VIDEO CAROUSEL
  videoList: { 
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  videoCard: { 
    marginRight: 15, 
    alignItems: "center" 
  },
  videoImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 10 
  },
  videoTitle: { 
    color: "#fff", 
    marginTop: 5, 
    fontSize: 14,
  },

  // ⚪ MUSIC LIST
  musicList: {
    flex: 1,
  },
  musicItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 10,
    padding: 15,
  },
  musicInfo: { 
    flex: 1 
  },
  musicTitle: { 
    color: "#fff", 
    fontSize: 16,
    marginBottom: 4,
  },
  musicArtist: {
    color: "#ccc", 
    fontSize: 14,
  },

  // 🟠 NOW PLAYING
  nowPlaying: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#6C0AAB",
    padding: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  nowTitle: { 
    color: "#fff", 
    fontWeight: "bold",
    maxWidth: 200,
  },
  nowArtist: { 
    color: "#ccc", 
    fontSize: 12,
    maxWidth: 200,
  },
  nowControls: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 15 
  },
});