import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function NetworkDiagnosticsScreen() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const goToHome = () => {
    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Diagnostics</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Go to Home" 
          onPress={goToHome} 
        />
      </View>
      
      <Text style={styles.resultText}>This is a network diagnostics screen</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Network Information:</Text>
        <Text>• This screen was created to resolve TypeScript errors</Text>
        <Text>• The import error was a cache issue</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    minWidth: '80%',
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    minWidth: '80%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});