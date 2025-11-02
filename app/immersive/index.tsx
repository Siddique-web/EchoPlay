import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ImmersiveScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const features = [
    {
      id: 'visualizer',
      title: 'Visualização 3D / Holográfica',
      description: 'Efeitos visuais em tempo real que reagem ao som',
      icon: 'analytics',
    },
    {
      id: 'ambient-mode',
      title: 'Ambiente Sonoro Dinâmico',
      description: 'Transforma o ambiente com base no som',
      icon: 'color-palette',
    },
    {
      id: 'mood-editor',
      title: 'Editor de humor audiovisual',
      description: 'Aplicar filtros que mudam a emoção do vídeo ou música',
      icon: 'brush',
    },
  ];

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
          Experiências Imersivas
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Experiências Imersivas e Inovadoras
        </Text>
        
        <Text style={[styles.description, { color: isDark ? '#ccc' : '#666' }]}>
          Transforme sua experiência de áudio e vídeo com tecnologias avançadas de visualização e controle de ambiente.
        </Text>

        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[styles.featureCard, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
            onPress={() => router.push(`/immersive/${feature.id}` as any)}

          >
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={24} color="#0a84ff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: isDark ? '#fff' : '#000' }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: isDark ? '#ccc' : '#666' }]}>{feature.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />
          </TouchableOpacity>
        ))}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});