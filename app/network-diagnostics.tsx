import Constants from 'expo-constants';
import * as Network from 'expo-network';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NetworkDiagnostics() {
  const router = useRouter();
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        setLoading(true);
        const ip = await Network.getIpAddressAsync();
        const networkState = await Network.getNetworkStateAsync();
        
        setNetworkInfo({
          ipAddress: ip,
          isConnected: networkState.isConnected,
          isInternetReachable: networkState.isInternetReachable,
          type: networkState.type,
          apiBaseUrl: Constants.expoConfig?.extra?.API_URL || process.env.API_URL || 'Not set'
        });
      } catch (err) {
        setError('Failed to fetch network information: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
  }, []);

  const testApiConnection = async () => {
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.API_URL || process.env.API_URL || 'https://echoplay-apii.onrender.com';
      const response = await fetch(`${apiBaseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return { success: true, status: response.status };
      } else {
        return { success: false, status: response.status, error: 'API returned non-OK status' };
      }
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiTestResult = await testApiConnection();
      
      setNetworkInfo((prev: any) => ({
        ...prev,
        apiTestResult: apiTestResult
      }));
    } catch (err) {
      setError('Diagnostics failed: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Network Diagnostics</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Running diagnostics...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : networkInfo ? (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Network Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>IP Address:</Text>
            <Text style={styles.value}>{networkInfo.ipAddress}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Connected:</Text>
            <Text style={styles.value}>{networkInfo.isConnected ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Internet Reachable:</Text>
            <Text style={styles.value}>{networkInfo.isInternetReachable ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Network Type:</Text>
            <Text style={styles.value}>{networkInfo.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>API Base URL:</Text>
            <Text style={styles.value}>{networkInfo.apiBaseUrl}</Text>
          </View>

          {networkInfo.apiTestResult && (
            <>
              <Text style={styles.sectionTitle}>API Connection Test</Text>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Success:</Text>
                <Text style={[styles.value, { color: networkInfo.apiTestResult.success ? 'green' : 'red' }]}>
                  {networkInfo.apiTestResult.success ? 'Yes' : 'No'}
                </Text>
              </View>
              {networkInfo.apiTestResult.status && (
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Status Code:</Text>
                  <Text style={styles.value}>{networkInfo.apiTestResult.status}</Text>
                </View>
              )}
              {networkInfo.apiTestResult.error && (
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Error:</Text>
                  <Text style={styles.value}>{networkInfo.apiTestResult.error}</Text>
                </View>
              )}
            </>
          )}
        </View>
      ) : null}

      <TouchableOpacity style={styles.testButton} onPress={runDiagnostics}>
        <Text style={styles.testButtonText}>Run API Connection Test</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});