import { useMusic } from '@/contexts/MusicContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Global reference to the currently playing sound
let currentSound: Audio.Sound | null = null;

export default function MusicPlayerScreen() {
  const { music, fromFooter } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { 
    currentMusic, 
    isPlaying, 
    setCurrentMusic, 
    setIsPlaying, 
    playbackCommand, 
    clearPlaybackCommand 
  } = useMusic();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Parse music data
  const musicData = typeof music === 'string' ? JSON.parse(music) : music;
  
  console.log('Music data received:', musicData);

  const handleBack = () => {
    router.back();
  };

  const loadSound = async () => {
    try {
      if (!musicData?.url) {
        console.error('No URL found in music data:', musicData);
        setError(true);
        setLoading(false);
        return;
      }

      console.log('Attempting to load sound from URL:', musicData.url);
      
      // Check if URL is valid
      if (!musicData.url.startsWith('http')) {
        console.error('Invalid URL:', musicData.url);
        setError(true);
        setLoading(false);
        return;
      }

      // Stop any currently playing sound
      if (currentSound) {
        console.log('Stopping currently playing sound');
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await currentSound.stopAsync();
        }
        // Unload the previous sound
        await currentSound.unloadAsync();
      }

      // Unload any existing sound in this component
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode for better playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // DoNotMix
        interruptionModeAndroid: 1, // DoNotMix
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create sound with autoplay
      const { sound } = await Audio.Sound.createAsync(
        { uri: musicData.url },
        { 
          shouldPlay: true, // Start playing immediately
          progressUpdateIntervalMillis: 1000 // Update every second
        }
      );
      
      soundRef.current = sound;
      currentSound = sound; // Set as current sound
      setIsPlaying(true); // Update global context
      setCurrentMusic(musicData); // Update global context with current music
      
      sound.setOnPlaybackStatusUpdate((status) => {
        console.log('Playback status update:', status);
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying); // Update global context
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
        } else if (status.error) {
          console.error('Playback error:', status.error);
          setError(true);
          setLoading(false);
          setIsPlaying(false); // Update global context
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading sound:', err);
      setError(true);
      setLoading(false);
      setIsPlaying(false); // Update global context
      Alert.alert('Error', 'Failed to load music: ' + (err as Error).message);
    }
  };

  const togglePlayback = async () => {
    if (!soundRef.current || loading) return;
    
    try {
      const status = await soundRef.current.getStatusAsync();
      console.log('Current playback status:', status);
      if (status.isLoaded) {
        if (status.isPlaying) {
          console.log('Pausing playback');
          await soundRef.current.pauseAsync();
          setIsPlaying(false); // Update global context
        } else {
          console.log('Starting playback');
          // Stop any other currently playing sound
          if (currentSound && currentSound !== soundRef.current) {
            const otherStatus = await currentSound.getStatusAsync();
            if (otherStatus.isLoaded && otherStatus.isPlaying) {
              await currentSound.stopAsync();
            }
            // Unload the previous sound
            await currentSound.unloadAsync();
          }
          currentSound = soundRef.current;
          await soundRef.current.playAsync();
          setIsPlaying(true); // Update global context
        }
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      Alert.alert('Error', 'Failed to play/pause music');
    }
  };

  const toggleFavorite = () => {
    // TODO: Implement actual favorite functionality
    setIsFavorite(!isFavorite);
    // In a real implementation, you would save this to a database or local storage
  };

  const skipForward = async () => {
    if (!soundRef.current || loading) return;
    
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.min(status.positionMillis + 10000, status.durationMillis || status.positionMillis + 10000);
        await soundRef.current.setPositionAsync(newPosition);
      }
    } catch (err) {
      console.error('Error skipping forward:', err);
    }
  };

  const skipBackward = async () => {
    if (!soundRef.current || loading) return;
    
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max(status.positionMillis - 10000, 0);
        await soundRef.current.setPositionAsync(newPosition);
      }
    } catch (err) {
      console.error('Error skipping backward:', err);
    }
  };

  // Handle playback commands from context
  useEffect(() => {
    if (!playbackCommand) return;
    
    switch (playbackCommand) {
      case 'play':
        if (!isPlaying && soundRef.current) {
          togglePlayback();
        }
        break;
      case 'pause':
        if (isPlaying && soundRef.current) {
          togglePlayback();
        }
        break;
      case 'toggle':
        if (soundRef.current) {
          togglePlayback();
        }
        break;
      default:
        break;
    }
    
    clearPlaybackCommand();
  }, [playbackCommand]);

  const formatTime = (millis: number) => {
    if (isNaN(millis) || millis <= 0) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    loadSound();
    
    return () => {
      // Always unload the sound when component unmounts
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        // If this was the current sound, clear the global reference
        if (currentSound === soundRef.current) {
          currentSound = null;
        }
        soundRef.current = null;
      }
      setIsPlaying(false); // Update global context
      setCurrentMusic(null); // Update global context
    };
  }, []);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Music Player
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: isDark ? '#ccc' : '#666' }]}>
            Failed to load music
          </Text>
          <Text style={[styles.errorSubText, { color: isDark ? '#999' : '#999' }]}>
            Please check your internet connection
          </Text>
          <Text style={[styles.errorSubText, { color: isDark ? '#999' : '#999', fontSize: 12, marginTop: 10 }]}>
            URL: {musicData?.url || 'No URL provided'}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: '#0a84ff' }]}
            onPress={loadSound}
          >
            <Text style={[styles.retryButtonText, { color: '#fff' }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
          {musicData?.title || 'Music Player'}
        </Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ef4444" : (isDark ? '#fff' : '#000')} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a84ff" />
            <Text style={[styles.loadingText, { color: isDark ? '#ccc' : '#666' }]}>
              Loading music...
            </Text>
          </View>
        ) : (
          <>
            {/* Album Art Placeholder */}
            <View style={[styles.albumArt, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
              <Ionicons name="musical-notes" size={80} color={isDark ? '#666' : '#999'} />
            </View>
            
            {/* Music Info */}
            <View style={styles.infoContainer}>
              <Text style={[styles.musicTitle, { color: isDark ? '#fff' : '#000' }]}>{musicData?.title || 'Untitled Music'}</Text>
              <Text style={[styles.musicArtist, { color: isDark ? '#ccc' : '#666' }]}>{musicData?.artist || 'Unknown Artist'}</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={[styles.timeText, { color: isDark ? '#ccc' : '#666' }]}>{formatTime(position)}</Text>
              <View style={[styles.progressBar, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: duration > 0 ? `${(position / duration) * 100}%` : '0%',
                      backgroundColor: '#0a84ff'
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.timeText, { color: isDark ? '#ccc' : '#666' }]}>{formatTime(duration)}</Text>
            </View>
            
            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
                <Ionicons name="play-skip-back" size={32} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={togglePlayback} 
                style={[styles.playButton, { backgroundColor: '#0a84ff' }]}
                disabled={loading}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={32} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
                <Ionicons name="play-skip-forward" size={32} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  favoriteButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  albumArt: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  musicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  musicArtist: {
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  timeText: {
    fontSize: 14,
    width: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 20,
  },
});
