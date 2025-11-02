import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { initDB, loginUser, registerUser } from '../utils/db/database';

const DatabaseTest = () => {
  const [testStatus, setTestStatus] = useState<string>('Not started');
  const [testResult, setTestResult] = useState<string>('');

  const runTest = async () => {
    try {
      setTestStatus('Initializing database...');
      await initDB();
      setTestResult('Database initialized successfully');
      
      setTestStatus('Registering test user...');
      await registerUser('test@example.com', 'password123');
      setTestResult(prev => prev + '\nUser registered successfully');
      
      setTestStatus('Logging in test user...');
      const user = await loginUser('test@example.com', 'password123');
      setTestResult(prev => prev + `\nLogin successful: ${JSON.stringify(user)}`);
      
      setTestStatus('Test completed successfully!');
    } catch (error: unknown) {
      setTestStatus('Test failed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestResult(`Error: ${errorMessage}`);
      Alert.alert('Test Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Test</Text>
      <Text style={styles.status}>Status: {testStatus}</Text>
      <Text style={styles.result}>Result: {testResult}</Text>
      <TouchableOpacity style={styles.button} onPress={runTest}>
        <Text style={styles.buttonText}>Run Database Test</Text>
      </TouchableOpacity>
    </View>
  );
};

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
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  result: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DatabaseTest;