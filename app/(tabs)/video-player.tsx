import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Simple video player component using expo-video
export default function VideoPlayerScreen() {
  const { video } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Parse video data safely
  let videoData = null;
  try {
    videoData = typeof video === 'string' ? JSON.parse(video) : video;
  } catch (e) {
    console.error('Error parsing video data:', e);
    videoData = {};
  }

  // Create video player
  const player = useVideoPlayer(videoData?.url || '', (player) => {
    player.loop = false;
    player.muted = false;
    player.play();
  });

  // Get player status using useEvent hook
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  const handleBack = () => {
    router.back();
  };

  // Update loading state based on player status
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      setError(false);
    } else if (status === 'readyToPlay') {
      setLoading(false);
      setError(false);
    } else if (status === 'error') {
      setLoading(false);
      setError(true);
      Alert.alert('Error', 'Failed to load video');
    }
  }, [status]);

  // For web platform, we'll use HTML5 video as fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
            {videoData?.title || 'Video Player'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Web Video Player */}
        <View style={styles.videoContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0a84ff" />
              <Text style={[styles.loadingText, { color: isDark ? '#ccc' : '#666' }]}>
                Loading video...
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text style={[styles.errorText, { color: isDark ? '#ccc' : '#666' }]}>
                Failed to load video
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: '#0a84ff' }]}
                onPress={() => window.location.reload()}
              >
                <Text style={[styles.retryButtonText, { color: '#fff' }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            videoData?.url ? (
              <video
                src={videoData.url}
                controls
                style={styles.video as any}
                onLoadedData={() => setLoading(false)}
                onError={() => {
                  setError(true);
                  setLoading(false);
                  Alert.alert('Error', 'Failed to load video');
                }}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text style={[styles.errorText, { color: isDark ? '#ccc' : '#666' }]}>
                  No video URL available
                </Text>
              </View>
            )
          )}

          {/* Video Info */}
          <View style={[styles.infoContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.videoTitle, { color: isDark ? '#fff' : '#000' }]}>{videoData?.title || 'Untitled Video'}</Text>
            {videoData?.description ? (
              <Text style={[styles.videoDescription, { color: isDark ? '#ccc' : '#666' }]}>{videoData.description}</Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  // Native mobile player using expo-video
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
          {videoData?.title || 'Video Player'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a84ff" />
            <Text style={[styles.loadingText, { color: isDark ? '#ccc' : '#666' }]}>
              Loading video...
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={[styles.errorText, { color: isDark ? '#ccc' : '#666' }]}>
              Failed to load video
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: '#0a84ff' }]}
              onPress={() => {
                // Reinitialize the player
                player.replace(videoData?.url || '');
              }}
            >
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : videoData?.url ? (
          <View style={styles.videoWrapper}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={[styles.errorText, { color: isDark ? '#ccc' : '#666' }]}>
              No video URL available
            </Text>
          </View>
        )}

        {/* Video Info */}
        <View style={[styles.infoContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.videoTitle, { color: isDark ? '#fff' : '#000' }]}>{videoData?.title || 'Untitled Video'}</Text>
          {videoData?.description ? (
            <Text style={[styles.videoDescription, { color: isDark ? '#ccc' : '#666' }]}>{videoData.description}</Text>
          ) : null}
        </View>
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
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ccc',
  },
  errorContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
    height: '100%',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#ccc',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    width: '100%',
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  videoDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
  },
});