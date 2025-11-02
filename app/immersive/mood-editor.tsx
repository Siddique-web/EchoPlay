import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MoodEditorScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedMood, setSelectedMood] = useState('nostalgia');

  const moods = [
    {
      id: 'nostalgia',
      name: 'Nostalgia',
      icon: 'time',
      description: 'Aplica reverb + filtro sépia',
      color: '#8D6E63',
      effects: ['Reverb aumentado', 'Filtro sépia', 'BPM reduzido', 'Saturação suave']
    },
    {
      id: 'energetico',
      name: 'Energético',
      icon: 'flash',
      description: 'Acelera BPM e aumenta saturação',
      color: '#FF5252',
      effects: ['BPM acelerado', 'Saturação aumentada', 'Graves reforçados', 'Agudos realçados']
    },
    {
      id: 'relaxamento',
      name: 'Relaxamento',
      icon: 'moon',
      description: 'Suaviza sons e aplica filtros calmantes',
      color: '#4FC3F7',
      effects: ['Reverb suave', 'Filtro passa-baixa', 'BPM reduzido', 'Harmonia acentuada']
    },
    {
      id: 'festa',
      name: 'Modo Festa',
      icon: 'balloon',
      description: 'Efeitos vibrantes e dinâmicos',
      color: '#E91E63',
      effects: ['Compressão dinâmica', 'Filtros estroboscópicos', 'BPM variável', 'Efeitos espaciais']
    },
    {
      id: 'concentracao',
      name: 'Concentração',
      icon: 'school',
      description: 'Foco e clareza sonora',
      color: '#8BC34A',
      effects: ['Filtro passa-faixa', 'Redução de ruído', 'BPM constante', 'Frequências médias realçadas']
    },
    {
      id: 'romance',
      name: 'Romance',
      icon: 'heart',
      description: 'Atmosfera romântica e envolvente',
      color: '#9C27B0',
      effects: ['Reverb espaçoso', 'Filtro warm', 'BPM lento', 'Harmonias suaves']
    }
  ];

  const applyMood = (moodId: string) => {
    setSelectedMood(moodId);
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
          Editor de Humor Audiovisual
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Editor de Humor Audiovisual
        </Text>
        
        <Text style={[styles.description, { color: isDark ? '#ccc' : '#666' }]}>
          Aplique filtros que mudam a emoção do vídeo ou música
        </Text>

        {/* Mood Selection */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
            Selecione um Modo
          </Text>
          <Text style={[styles.cardDescription, { color: isDark ? '#ccc' : '#666' }]}>
            Escolha o humor desejado para aplicar aos seus conteúdos
          </Text>
          
          <View style={styles.moodGrid}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodItem,
                  selectedMood === mood.id && styles.selectedMoodItem,
                  { 
                    backgroundColor: isDark ? '#333' : '#fff',
                    borderColor: selectedMood === mood.id ? mood.color : (isDark ? '#444' : '#ddd')
                  }
                ]}
                onPress={() => applyMood(mood.id)}
              >
                <View 
                  style={[
                    styles.moodIconContainer,
                    { backgroundColor: `${mood.color}20` }
                  ]}
                >
                  <Ionicons 
                    name={mood.icon as any} 
                    size={24} 
                    color={mood.color} 
                  />
                </View>
                <Text style={[
                  styles.moodName,
                  { 
                    color: selectedMood === mood.id ? mood.color : (isDark ? '#fff' : '#000')
                  }
                ]}>
                  {mood.name}
                </Text>
                <Text style={[styles.moodDescription, { color: isDark ? '#ccc' : '#666' }]}>
                  {mood.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Applied Mood Details */}
        {selectedMood && (
          <View style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
              Efeitos Aplicados
            </Text>
            <Text style={[styles.cardDescription, { color: isDark ? '#ccc' : '#666' }]}>
              Modo selecionado: {moods.find(m => m.id === selectedMood)?.name}
            </Text>
            
            <View style={styles.effectsList}>
              {moods.find(m => m.id === selectedMood)?.effects.map((effect, index) => (
                <View key={index} style={styles.effectItem}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color="#0a84ff" 
                    style={styles.effectIcon}
                  />
                  <Text style={[styles.effectText, { color: isDark ? '#ccc' : '#666' }]}>
                    {effect}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Apply Button */}
        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: '#0a84ff' }]}
          onPress={() => {}}
        >
          <Text style={styles.applyButtonText}>Aplicar ao Conteúdo Atual</Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Ionicons name="information-circle" size={24} color="#0a84ff" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
              Como funciona?
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#ccc' : '#666' }]}>
              O editor aplica filtros de áudio e vídeo em tempo real que modificam a percepção emocional do conteúdo.
            </Text>
          </View>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedMoodItem: {
    borderWidth: 2,
  },
  moodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  moodDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  effectsList: {
    marginTop: 15,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  effectIcon: {
    marginRight: 10,
  },
  effectText: {
    fontSize: 14,
    flex: 1,
  },
  applyButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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