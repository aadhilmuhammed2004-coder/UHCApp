import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { API_BASE_URL } from '../config';

export default function SettingsScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadUrl();
  }, []);

  async function loadUrl() {
    try {
      const stored = await AsyncStorage.getItem('api_base_url');
      setUrl(stored || API_BASE_URL);
    } catch {
      setUrl(API_BASE_URL);
    }
  }

  async function saveUrl() {
    try {
      const cleaned = url.trim().replace(/\/$/, '');
      await AsyncStorage.setItem('api_base_url', cleaned);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      Alert.alert('Saved!', 'Server URL updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not save URL.');
    }
  }

  async function resetUrl() {
    await AsyncStorage.removeItem('api_base_url');
    setUrl(API_BASE_URL);
    Alert.alert('Reset', 'URL reset to default.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>🌐 SERVER URL</Text>
          <Text style={styles.hint}>
            Paste your ngrok URL here every time it changes.
            No rebuild needed!
          </Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://your-ngrok-url.ngrok-free.app"
            placeholderTextColor="#4a5470"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={saveUrl}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✅ Saved!' : 'Save URL'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={resetUrl}>
            <Text style={styles.resetBtnText}>Reset to Default</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 How to use:</Text>
          <Text style={styles.infoText}>1. Start Django on your laptop</Text>
          <Text style={styles.infoText}>2. Start ngrok → copy the URL</Text>
          <Text style={styles.infoText}>3. Paste URL here → Save</Text>
          <Text style={styles.infoText}>4. Go back → Scan card!</Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 20,
  },
  backBtn: { color: '#00c9a7', fontSize: 15, fontWeight: '600', width: 60 },
  topBarTitle: { color: '#dce4f5', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: '#121620', borderRadius: 16,
    borderWidth: 1, borderColor: '#1f2638',
    padding: 20, marginBottom: 16,
  },
  label: {
    fontSize: 11, color: '#8b96b0',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  hint: {
    fontSize: 13, color: '#8b96b0',
    lineHeight: 20, marginBottom: 16,
  },
  input: {
    backgroundColor: '#07090f', borderWidth: 1,
    borderColor: '#1f2638', borderRadius: 12,
    padding: 14, color: '#dce4f5',
    fontSize: 13, marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#00c9a7', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 10,
  },
  saveBtnDone: { backgroundColor: '#1f7a5c' },
  saveBtnText: { color: '#07090f', fontWeight: '700', fontSize: 15 },
  resetBtn: {
    borderWidth: 1, borderColor: '#1f2638',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  resetBtnText: { color: '#8b96b0', fontWeight: '600', fontSize: 14 },
  infoCard: {
    backgroundColor: '#121620', borderRadius: 16,
    borderWidth: 1, borderColor: '#1f2638', padding: 20,
  },
  infoTitle: {
    color: '#dce4f5', fontWeight: '700',
    fontSize: 14, marginBottom: 12,
  },
  infoText: {
    color: '#8b96b0', fontSize: 13,
    lineHeight: 26,
  },
});