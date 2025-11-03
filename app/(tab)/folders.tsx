import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Folder {
  id: string;
  name: string;
  type: 'music' | 'video';
  items: any[];
  createdAt: string;
}

// Add this interface for folder items
interface FolderItem {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
  thumbnail?: string;
  url: string;
  createdAt?: string;
  description?: string;
}

export default function FoldersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderType, setFolderType] = useState<'music' | 'video'>('music');
  const [loading, setLoading] = useState(true);
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FolderItem | null>(null);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([]);

  // Load folders from storage
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const storedFolders = await AsyncStorage.getItem('userFolders');
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const saveFolders = async (foldersToSave: Folder[]) => {
    try {
      await AsyncStorage.setItem('userFolders', JSON.stringify(foldersToSave));
    } catch (error) {
      console.error('Error saving folders:', error);
      Alert.alert('Error', 'Failed to save folders');
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      type: folderType,
      items: [],
      createdAt: new Date().toISOString(),
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    await saveFolders(updatedFolders);

    setNewFolderName('');
    setShowCreateFolder(false);
    Alert.alert('Success', 'Folder created successfully');
  };

  const deleteFolder = async (folderId: string) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to delete this folder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedFolders = folders.filter(folder => folder.id !== folderId);
            setFolders(updatedFolders);
            await saveFolders(updatedFolders);
          }
        }
      ]
    );
  };

  // Function to add item to folder
  const addItemToFolder = async (folderId: string, item: FolderItem) => {
    try {
      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          // Check if item already exists in folder
          const itemExists = folder.items.some((i: FolderItem) => i.id === item.id);
          if (itemExists) {
            Alert.alert('Error', 'Item already exists in this folder');
            return folder;
          }
          
          return {
            ...folder,
            items: [...folder.items, item]
          };
        }
        return folder;
      });
      
      setFolders(updatedFolders);
      await saveFolders(updatedFolders);
      setShowAddToFolder(false);
      setSelectedItem(null);
      Alert.alert('Success', 'Item added to folder successfully');
    } catch (error) {
      console.error('Error adding item to folder:', error);
      Alert.alert('Error', 'Failed to add item to folder');
    }
  };

  // Function to show add to folder modal
  const showAddToFolderModal = (item: FolderItem, itemType: 'music' | 'video') => {
    const filteredFolders = folders.filter(folder => folder.type === itemType);
    if (filteredFolders.length === 0) {
      Alert.alert(
        'No Folders', 
        `You don't have any ${itemType} folders. Create one first.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Folder', onPress: () => {
              setFolderType(itemType);
              setShowCreateFolder(true);
            }
          }
        ]
      );
      return;
    }
    
    setSelectedItem(item);
    setAvailableFolders(filteredFolders);
    setShowAddToFolder(true);
  };

  const renderFolderItem = ({ item }: { item: Folder }) => (
    <TouchableOpacity 
      style={[styles.folderItem, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
      onPress={() => router.push({
        pathname: '/(tabs)/folder-detail',
        params: { folderId: item.id }
      } as any)}
    >
      <View style={styles.folderIcon}>
        <IconSymbol 
          size={24} 
          name={item.type === 'music' ? 'music.note' : 'video'} 
          color={isDark ? '#fff' : '#000'} 
        />
      </View>
      <View style={styles.folderInfo}>
        <Text style={[styles.folderName, { color: isDark ? '#fff' : '#000' }]}>{item.name}</Text>
        <Text style={[styles.folderCount, { color: isDark ? '#ccc' : '#666' }]}>
          {item.items.length} items
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteFolder(item.id)}
      >
        <IconSymbol size={20} name="trash" color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>Pastas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateFolder(true)}
        >
          <IconSymbol size={24} name="plus" color="#0a84ff" />
        </TouchableOpacity>
      </View>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>Criar Nova Pasta</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                color: isDark ? '#fff' : '#000'
              }]}
              placeholder="Nome da pasta"
              placeholderTextColor={isDark ? '#888' : '#999'}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeOption, 
                  folderType === 'music' && styles.selectedTypeOption,
                  { backgroundColor: folderType === 'music' ? '#0a84ff' : (isDark ? '#1a1a1a' : '#f5f5f5') }
                ]}
                onPress={() => setFolderType('music')}
              >
                <IconSymbol size={20} name="music.note" color={folderType === 'music' ? '#fff' : (isDark ? '#ccc' : '#666')} />
                <Text style={[styles.typeText, { 
                  color: folderType === 'music' ? '#fff' : (isDark ? '#ccc' : '#666')
                }]}>Música</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeOption, 
                  folderType === 'video' && styles.selectedTypeOption,
                  { backgroundColor: folderType === 'video' ? '#4CAF50' : (isDark ? '#1a1a1a' : '#f5f5f5') }
                ]}
                onPress={() => setFolderType('video')}
              >
                <IconSymbol size={20} name="video" color={folderType === 'video' ? '#fff' : (isDark ? '#ccc' : '#666')} />
                <Text style={[styles.typeText, { 
                  color: folderType === 'video' ? '#fff' : (isDark ? '#ccc' : '#666')
                }]}>Vídeo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: isDark ? '#555' : '#eee' }]}
                onPress={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: isDark ? '#fff' : '#000' }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#0a84ff' }]}
                onPress={createFolder}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Folders List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={[styles.loadingText, { color: isDark ? '#ccc' : '#666' }]}>Carregando pastas...</Text>
        ) : folders.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol size={48} name="folder" color={isDark ? '#666' : '#999'} />
            <Text style={[styles.emptyStateText, { color: isDark ? '#ccc' : '#666' }]}>
              Nenhuma pasta criada ainda
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: isDark ? '#999' : '#999' }]}>
              Toque no botão + para criar sua primeira pasta
            </Text>
          </View>
        ) : (
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            renderItem={renderFolderItem}
            contentContainerStyle={styles.folderList}
          />
        )}
      </ScrollView>

      {/* Add to Folder Modal */}
      {showAddToFolder && selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#333' : '#fff' }]}> 
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>Adicionar à Pasta</Text>
            <Text style={[styles.modalSubtitle, { color: isDark ? '#ccc' : '#666' }]}>Selecione uma pasta para adicionar:</Text>
            <Text style={[styles.itemTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>{selectedItem.title}</Text>
            
            <ScrollView style={styles.folderOptionsList}>
              {availableFolders.map((folder: Folder) => (
                <TouchableOpacity 
                  key={folder.id}
                  style={[styles.folderOptionItem, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
                  onPress={() => addItemToFolder(folder.id, selectedItem)}
                >
                  <IconSymbol 
                    size={20} 
                    name={folder.type === 'music' ? 'music.note' : 'video'} 
                    color={isDark ? '#fff' : '#000'} 
                  />
                  <Text style={[styles.folderOptionName, { color: isDark ? '#fff' : '#000' }]}>{folder.name}</Text>
                  <Text style={[styles.folderOptionCount, { color: isDark ? '#ccc' : '#666' }]}>({folder.items.length} itens)</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: isDark ? '#555' : '#eee' }]}
                onPress={() => {
                  setShowAddToFolder(false);
                  setSelectedItem(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: isDark ? '#fff' : '#000' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
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
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedTypeOption: {
    // No additional styling needed, handled by backgroundColor
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  folderList: {
    padding: 20,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  folderIcon: {
    marginRight: 15,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  folderOptionsList: {
    maxHeight: 200,
    marginVertical: 10,
  },
  folderOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  folderOptionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  folderOptionCount: {
    fontSize: 14,
    marginLeft: 5,
  },
});