import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SchedulerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [scheduleName, setScheduleName] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [isSelectingMusic, setIsSelectingMusic] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCreateSchedule = () => {
    if (!scheduleName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a agenda');
      return;
    }
    
    if (!selectedMusic) {
      Alert.alert('Erro', 'Por favor, selecione uma música');
      return;
    }
    
    // TODO: Implement actual schedule creation
    Alert.alert(
      'Agenda Criada', 
      `Agenda "${scheduleName}" criada para ${formatTime(selectedTime)} com a música "${selectedMusic.title}"`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
    
    console.log('Schedule created:', {
      name: scheduleName,
      time: selectedTime,
      music: selectedMusic
    });
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
          Criar Agenda
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
          Nova Agenda
        </Text>
        
        <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>
            Nome da Agenda
          </Text>
          <TextInput
            style={[styles.input, { 
              color: isDark ? '#fff' : '#000',
              backgroundColor: isDark ? '#333' : '#fff'
            }]}
            placeholder="Ex: Acordar, Dormir, Estudar..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={scheduleName}
            onChangeText={setScheduleName}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>
            Horário
          </Text>
          <TouchableOpacity 
            style={[styles.timeButton, { 
              backgroundColor: isDark ? '#333' : '#fff'
            }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.timeText, { color: isDark ? '#fff' : '#000' }]}>
              {formatTime(selectedTime)}
            </Text>
            <Ionicons name="time" size={20} color={isDark ? '#ccc' : '#666'} />
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          // Simple time picker implementation for web compatibility
          <View style={[styles.timePickerContainer, { backgroundColor: isDark ? '#333' : '#fff' }]}>
            <Text style={[styles.timePickerTitle, { color: isDark ? '#fff' : '#000' }]}>
              Selecione o horário
            </Text>
            <View style={styles.timeInputs}>
              <TextInput
                style={[styles.timeInput, { 
                  color: isDark ? '#fff' : '#000',
                  backgroundColor: isDark ? '#444' : '#eee'
                }]}
                placeholder="HH"
                placeholderTextColor={isDark ? '#999' : '#666'}
                keyboardType="numeric"
                maxLength={2}
                defaultValue={selectedTime.getHours().toString().padStart(2, '0')}
                onChangeText={(text) => {
                  const hours = parseInt(text) || 0;
                  const newDate = new Date(selectedTime);
                  newDate.setHours(Math.min(23, Math.max(0, hours)));
                  setSelectedTime(newDate);
                }}
              />
              <Text style={[styles.timeSeparator, { color: isDark ? '#ccc' : '#666' }]}>:</Text>
              <TextInput
                style={[styles.timeInput, { 
                  color: isDark ? '#fff' : '#000',
                  backgroundColor: isDark ? '#444' : '#eee'
                }]}
                placeholder="MM"
                placeholderTextColor={isDark ? '#999' : '#666'}
                keyboardType="numeric"
                maxLength={2}
                defaultValue={selectedTime.getMinutes().toString().padStart(2, '0')}
                onChangeText={(text) => {
                  const minutes = parseInt(text) || 0;
                  const newDate = new Date(selectedTime);
                  newDate.setMinutes(Math.min(59, Math.max(0, minutes)));
                  setSelectedTime(newDate);
                }}
              />
            </View>
            <TouchableOpacity 
              style={[styles.timePickerButton, { backgroundColor: '#0a84ff' }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.timePickerButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.label, { color: isDark ? '#ccc' : '#666' }]}>
            Música
          </Text>
          {selectedMusic ? (
            <View style={[styles.selectedMusic, { backgroundColor: isDark ? '#333' : '#fff' }]}>
              <View style={styles.musicInfo}>
                <Text style={[styles.musicTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
                  {selectedMusic.title}
                </Text>
                {selectedMusic.artist && (
                  <Text style={[styles.musicArtist, { color: isDark ? '#ccc' : '#666' }]} numberOfLines={1}>
                    {selectedMusic.artist}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedMusic(null)}
                style={styles.clearMusicButton}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.selectMusicButton, { 
                backgroundColor: isDark ? '#333' : '#fff'
              }]}
              onPress={() => setIsSelectingMusic(true)}
            >
              <Text style={[styles.selectMusicText, { color: isDark ? '#ccc' : '#666' }]}>
                Selecionar música
              </Text>
              <Ionicons name="musical-notes" size={20} color={isDark ? '#ccc' : '#666'} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: '#0a84ff' }]}
          onPress={handleCreateSchedule}
        >
          <Text style={styles.createButtonText}>Criar Agenda</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Music Selection Modal */}
      {isSelectingMusic && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#333' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
                Selecionar Música
              </Text>
              <TouchableOpacity 
                onPress={() => setIsSelectingMusic(false)}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
              Selecione uma música para esta agenda
            </Text>
            
            <ScrollView style={styles.musicList}>
              {/* TODO: Fetch and display actual music list */}
              <Text style={[styles.noMusicText, { color: isDark ? '#999' : '#666' }]}>
                Funcionalidade de seleção de música será implementada
              </Text>
            </ScrollView>
          </View>
        </View>
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
    marginBottom: 20,
  },
  inputGroup: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
  },
  timePickerContainer: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeInput: {
    width: 60,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    fontWeight: '600',
  },
  timePickerButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedMusic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  musicInfo: {
    flex: 1,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  musicArtist: {
    fontSize: 14,
  },
  clearMusicButton: {
    padding: 5,
  },
  selectMusicButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectMusicText: {
    fontSize: 16,
  },
  createButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalButton: {
    padding: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  musicList: {
    flex: 1,
  },
  noMusicText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 30,
  },
});