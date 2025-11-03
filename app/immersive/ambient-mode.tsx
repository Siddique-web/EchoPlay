import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AmbientModeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isAmbientMode, setIsAmbientMode] = useState(false);
  const [selectedLight, setSelectedLight] = useState('all');
  const [selectedColor, setSelectedColor] = useState('#FF5252'); // Default to Energy color
  const [isPlaying, setIsPlaying] = useState(false); // Simulate music playing state

  // Animation values for corner lights
  const cornerOpacity = useRef(new Animated.Value(0)).current;
  const cornerScale = useRef(new Animated.Value(1)).current;

  // Simulate audio levels for pulsing effect
  useEffect(() => {
    if (!isAmbientMode || !isPlaying) return;
    
    const interval = setInterval(() => {
      // Simulate audio level changes
      const level = Math.random() * 100;
      
      // Animate based on audio level
      Animated.parallel([
        Animated.timing(cornerOpacity, {
          toValue: 0.3 + (level / 300),
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cornerScale, {
          toValue: 1 + (level / 500),
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);
    
    return () => clearInterval(interval);
  }, [isAmbientMode, isPlaying]);

  const toggleAmbientMode = () => {
    setIsAmbientMode(!isAmbientMode);
  };

  const lightOptions = [
    { id: 'all', name: 'Todas as luzes', icon: 'bulb' },
    { id: 'living', name: 'Sala de estar', icon: 'tv' },
    { id: 'bedroom', name: 'Quarto', icon: 'bed' },
    { id: 'kitchen', name: 'Cozinha', icon: 'cafe' },
  ];

  const colorPresets = [
    { name: 'Energia', color: '#FF5252', description: 'Vermelho vibrante para alta energia' },
    { name: 'Relaxamento', color: '#4FC3F7', description: 'Azul suave para relaxamento' },
    { name: 'Festa', color: '#E91E63', description: 'Rosa elétrico para festas' },
    { name: 'Concentração', color: '#8BC34A', description: 'Verde claro para foco' },
    { name: 'Romance', color: '#9C27B0', description: 'Roxo romântico' },
    { name: 'Neutro', color: '#FFFFFF', description: 'Branco puro' },
  ];

  // Corner light component
  const CornerLight = ({ position }: { position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) => {
    const getPositionStyle = () => {
      switch (position) {
        case 'topLeft':
          return { top: 20, left: 20 };
        case 'topRight':
          return { top: 20, right: 20 };
        case 'bottomLeft':
          return { bottom: 20, left: 20 };
        case 'bottomRight':
          return { bottom: 20, right: 20 };
        default:
          return {};
      }
    };

    return (
      <Animated.View
        style={[
          styles.cornerLight,
          getPositionStyle(),
          {
            backgroundColor: selectedColor,
            opacity: cornerOpacity,
            transform: [{ scale: cornerScale }],
          },
        ]}
      />
    );
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
          Ambiente Sonoro Dinâmico
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Transformação de Ambiente
        </Text>
        
        <Text style={[styles.description, { color: isDark ? '#ccc' : '#666' }]}>
          Transforma o ambiente com base no som: controla luzes inteligentes e cria projeções 3D.
        </Text>

        {/* Ambient Mode Toggle */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <View style={styles.toggleHeader}>
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
              Modo Ambiente
            </Text>
            <TouchableOpacity 
              style={[styles.toggleButton, { backgroundColor: isAmbientMode ? '#0a84ff' : '#ccc' }]}
              onPress={toggleAmbientMode}
            >
              <View style={[styles.toggleKnob, { 
                transform: [{ translateX: isAmbientMode ? 20 : 0 }],
                backgroundColor: '#fff'
              }]} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardDescription, { color: isDark ? '#ccc' : '#666' }]}>
            {isAmbientMode 
              ? 'Modo ambiente ativado - As luzes estão sincronizadas com a música' 
              : 'Ative o modo ambiente para sincronizar as luzes com a música'}
          </Text>
        </View>

        {/* Light Selection */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
            Seleção de Luzes
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#ccc' : '#666' }]}>
            Escolha quais luzes inteligentes controlar
          </Text>
          
          <View style={styles.lightOptions}>
            {lightOptions.map((light) => (
              <TouchableOpacity
                key={light.id}
                style={[
                  styles.lightOption,
                  selectedLight === light.id && styles.selectedLightOption,
                  { 
                    backgroundColor: isDark ? '#333' : '#fff',
                    borderColor: selectedLight === light.id ? '#0a84ff' : (isDark ? '#444' : '#ddd')
                  }
                ]}
                onPress={() => setSelectedLight(light.id)}
              >
                <Ionicons 
                  name={light.icon as any} 
                  size={24} 
                  color={selectedLight === light.id ? '#0a84ff' : (isDark ? '#ccc' : '#666')} 
                />
                <Text style={[
                  styles.lightOptionText,
                  { 
                    color: selectedLight === light.id ? '#0a84ff' : (isDark ? '#ccc' : '#666')
                  }
                ]}>
                  {light.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Presets */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
            Presets de Cores
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#ccc' : '#666' }]}>
          Cores pré-definidas que mudam conforme a música
          </Text>
          
          <View style={styles.colorPresets}>
            {colorPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.colorPreset}
                onPress={() => setSelectedColor(preset.color)}
              >
                <View 
                  style={[
                    styles.colorCircle,
                    { backgroundColor: preset.color }
                  ]}
                />
                <View style={styles.colorInfo}>
                  <Text style={[styles.colorName, { color: isDark ? '#fff' : '#000' }]}>
                    {preset.name}
                  </Text>
                  <Text style={[styles.colorDescription, { color: isDark ? '#ccc' : '#666' }]}>
                    {preset.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Music Simulation Toggle */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <View style={styles.toggleHeader}>
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
              Simular Música
            </Text>
            <TouchableOpacity 
              style={[styles.toggleButton, { backgroundColor: isPlaying ? '#0a84ff' : '#ccc' }]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <View style={[styles.toggleKnob, { 
                transform: [{ translateX: isPlaying ? 20 : 0 }],
                backgroundColor: '#fff'
              }]} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardDescription, { color: isDark ? '#ccc' : '#666' }]}>
            {isPlaying 
              ? 'Simulação de música ativada - As luzes estão pulsando' 
              : 'Ative para simular música e ver as luzes pulsando'}
          </Text>
        </View>

        {/* 3D Sound Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Ionicons name="volume-high" size={24} color="#0a84ff" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
              Som Espacializado 3D
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#ccc' : '#666' }]}>
              Cria um "modo ambiente" com projeções e sons 3D (som espacializado).
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Corner lights - only visible when ambient mode is active */}
      {isAmbientMode && (
        <>
          <CornerLight position="topLeft" />
          <CornerLight position="topRight" />
          <CornerLight position="bottomLeft" />
          <CornerLight position="bottomRight" />
        </>
      )}
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
  },
  contentContainer: {
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
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  lightOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  lightOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedLightOption: {
    borderWidth: 2,
  },
  lightOptionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  colorPresets: {
    marginTop: 15,
  },
  colorPreset: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  colorDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
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
  // Corner light styles
  cornerLight: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: 1000,
  },
});