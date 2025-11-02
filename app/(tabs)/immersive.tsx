import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function ImmersiveTab() {
  const router = useRouter();

  // Redirect to the immersive section
  useEffect(() => {
    router.replace('/immersive' as any);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0a84ff" />
      <Text style={styles.text}>Carregando experiências imersivas...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});