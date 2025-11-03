import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Folder {
  id: string;
  name: string;
  type: 'music' | 'video';
  items: any[];
  createdAt: string;
}

interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
  thumbnail?: string;
}

export default function FolderDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { folderId } = useLocalSearchParams();
  
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);

  // Load folder details
  useEffect(() => {
    if (folderId) {
      loadFolderDetails();
    }
  }, [folderId]);

  const loadFolderDetails = async () => {
    try {
      setLoading(true);
      const storedFolders = await AsyncStorage.getItem('userFolders');
      if (storedFolders) {
        const folders = JSON.parse(storedFolders);
        const foundFolder = folders.find((f: Folder) => f.id === folderId);
        setFolder(foundFolder || null);
      }
    } catch (error) {
      console.error('Error loading folder details:', error);
      Alert.alert('Error', 'Failed to load folder details');
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromFolder = async (itemId: string) => {
    if (!folder) return;
    
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from the folder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedItems = folder.items.filter(item => item.id !== itemId);
            const updatedFolder = { ...folder, items: updatedItems };
            
            // Update in storage
            try {
              const storedFolders = await AsyncStorage.getItem('userFolders');
              if (storedFolders) {
                const folders = JSON.parse(storedFolders);
                const updatedFolders = folders.map((f: Folder) => 
                  f.id === folder.id ? updatedFolder : f
                );
                await AsyncStorage.setItem('userFolders', JSON.stringify(updatedFolders));
                setFolder(updatedFolder);
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item from folder');
            }
          }
        }
      ]
    );
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <View style={[styles.itemContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.artist && (
          <Text style={[styles.itemArtist, { color: isDark ? '#ccc' : '#666' }]} numberOfLines={1}>
            {item.artist}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.removeItemButton}
        onPress={() => removeItemFromFolder(item.id)}
      >
        <IconSymbol size={20} name="trash" color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#ccc' : '#666' }]}>
          Loading folder details...
        </Text>
      </View>
    );
  }

  if (!folder) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#ccc' : '#666' }]}>
          Folder not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#fff', borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
          {folder.name}
        </Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      {/* Folder Info */}
      <View style={styles.folderInfoContainer}>
        <View style={[styles.folderIconContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
          <IconSymbol 
            size={32} 
            name={folder.type === 'music' ? 'music.note' : 'video'} 
            color={isDark ? '#fff' : '#000'} 
          />
        </View>
        <View style={styles.folderDetails}>
          <Text style={[styles.folderName, { color: isDark ? '#fff' : '#000' }]}>{folder.name}</Text>
          <Text style={[styles.folderStats, { color: isDark ? '#ccc' : '#666' }]}>
            {folder.items.length} items • {folder.type === 'music' ? 'Music' : 'Video'}
          </Text>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.content}>
        {folder.items.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol size={48} name="music.note.list" color={isDark ? '#666' : '#999'} />
            <Text style={[styles.emptyStateText, { color: isDark ? '#ccc' : '#666' }]}>
              No items in this folder
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: isDark ? '#999' : '#999' }]}>
              Add items to your folder from the library
            </Text>
          </View>
        ) : (
          <FlatList
            data={folder.items}
            keyExtractor={(item) => item.id}
            renderItem={renderMediaItem}
            contentContainerStyle={styles.listContainer}
          />
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  folderInfoContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  folderIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  folderDetails: {
    flex: 1,
  },
  folderName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  folderStats: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemArtist: {
    fontSize: 14,
  },
  removeItemButton: {
    padding: 5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  errorText: {
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
});