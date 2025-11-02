import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VisualizerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0.7)).current;
  const rotateState = useRef(0);
  
  // Particle positions
  const particles = useRef(Array(20).fill(0).map((_, i) => ({
    id: i,
    x: Math.random() * 300,
    y: Math.random() * 500,
    size: Math.random() * 20 + 5,
    speed: Math.random() * 2 + 1,
  }))).current;

  // Simulate audio levels
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      // Simulate audio level changes
      const level = Math.random() * 100;
      setAudioLevel(level);
      
      // Update rotate state
      rotateState.current = (rotateState.current + (level / 50)) % 360;
      
      // Animate based on audio level
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1 + (level / 200),
          useNativeDriver: true,
        }),
        Animated.timing(rotateValue, {
          toValue: rotateState.current,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.5 + (level / 200),
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Render particles
  const renderParticles = () => {
    return particles.map((particle) => (
      <Animated.View
        key={particle.id}
        style={[
          styles.particle,
          {
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: opacityValue,
            transform: [
              { scale: scaleValue },
              { rotate: rotateValue.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })
              }
            ],
            backgroundColor: isDark ? '#0a84ff' : '#0066cc',
          }
        ]}
      />
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Visualização 3D / Holográfica
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Efeitos Visuais Reativos
        </Text>
        
        <Text style={[styles.description, { color: isDark ? '#ccc' : '#666' }]}>
          Visualização em tempo real que reage ao som (bass, ritmo, etc.)
        </Text>

        {/* Visualization Area */}
        <View style={[styles.visualizerContainer, { backgroundColor: isDark ? '#111' : '#f0f0f0' }]}>
          <View style={styles.visualizer}>
            {/* Central animated element */}
            <Animated.View 
              style={[
                styles.centerElement,
                {
                  transform: [
                    { scale: scaleValue },
                    { rotate: rotateValue.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ],
                  opacity: opacityValue,
                  backgroundColor: isDark ? '#0a84ff' : '#0066cc',
                }
              ]}
            />
            
            {/* Particles */}
            {renderParticles()}
            
            {/* Audio level bars */}
            <View style={styles.audioBars}>
              {Array(10).fill(0).map((_, i) => (
                <View 
                  key={i}
                  style={[
                    styles.audioBar,
                    {
                      height: Math.max(5, (audioLevel / 10) * (i + 1)),
                      backgroundColor: isDark ? '#0a84ff' : '#0066cc',
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: '#0a84ff' }]}
            onPress={togglePlayback}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        {/* VR/AR Support */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Ionicons name="glasses" size={24} color="#0a84ff" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
              Suporte VR/AR
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#ccc' : '#666' }]}>
              Se você tiver fones VR ou ecrã AR, o app exibe partículas e animações sincronizadas.
            </Text>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  visualizerContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
  },
  visualizer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerElement: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 50,
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
  },
  audioBars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 100,
    gap: 5,
  },
  audioBar: {
    width: 10,
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    padding: 15,
  },
  playButton: {
    padding: 20,
    borderRadius: 30,
    marginHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
  },
  infoIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});