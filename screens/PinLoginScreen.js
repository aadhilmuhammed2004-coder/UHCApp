import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiUrl } from '../utils/api';

export default function PinLoginScreen() {
  const router = useRouter();
  const [nfc_uid, setNfcUid] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!nfc_uid.trim()) {
      Alert.alert('Missing', 'Please enter your NFC Card ID');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Missing', 'Please enter your 4-digit PIN');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = await getApiUrl();
      const response = await fetch(`${baseUrl}/patient/api/pin-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfc_uid: nfc_uid.trim(), pin }),
      });

      const data = await response.json();

      if (data.success) {
        router.push({
          pathname: '/profile',
          params: { patient: JSON.stringify(data) }
        });
      } else {
        Alert.alert('Failed', data.message || 'Invalid ID or PIN');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  function handlePinPress(digit) {
    if (pin.length < 4) setPin(prev => prev + digit);
  }

  function handlePinDelete() {
    setPin(prev => prev.slice(0, -1));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PIN Login</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Enter Your Details</Text>
          <Text style={styles.subtitle}>
            Enter your NFC Card ID and 4-digit PIN
          </Text>

          {/* NFC ID Input */}
          <Text style={styles.label}>NFC CARD ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. NFC004"
            textAlign="center"
            placeholderTextColor="#4a5470"
            value={nfc_uid}
            onChangeText={setNfcUid}
            autoCapitalize="characters"
          />

          {/* PIN Display */}
          <Text style={styles.label}>4-DIGIT PIN</Text>
          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[styles.pinDot,
                  pin.length > i && styles.pinDotFilled]}
              />
            ))}
          </View>

          {/* PIN Keypad */}
          <View style={styles.keypad}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.keyBtn, key === '' && styles.keyBtnEmpty]}
                onPress={() => {
                  if (key === '⌫') handlePinDelete();
                  else if (key !== '') handlePinPress(key);
                }}
                disabled={key === ''}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Verifying...' : 'Access My Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { color: '#00c9a7', fontSize: 15, fontWeight: '600', width: 60 },
  headerTitle: { color: '#dce4f5', fontSize: 16, fontWeight: '700' },
  content: { alignItems: 'center', paddingTop: 20 },
  icon: { fontSize: 52, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#dce4f5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b96b0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#8b96b0',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#121620',
    borderWidth: 1,
    borderColor: '#1f2638',
    borderRadius: 12,
    padding: 14,
    color: '#dce4f5',
    fontSize: 16,
    width: '100%',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 2,
  },
  pinDisplay: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#1f2638',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#00c9a7',
    borderColor: '#00c9a7',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 260,
    gap: 12,
    marginBottom: 32,
    justifyContent: 'center',
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#121620',
    borderWidth: 1,
    borderColor: '#1f2638',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyText: {
    color: '#dce4f5',
    fontSize: 22,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#00c9a7',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  loginBtnDisabled: { backgroundColor: '#1f2638' },
  loginBtnText: {
    color: '#07090f',
    fontWeight: '700',
    fontSize: 16,
  },
});