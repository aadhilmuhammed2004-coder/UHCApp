import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert, Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { getApiUrl } from '../utils/api';

export default function ScanScreen() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle');
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanning]);

  async function startScan() {
    setScanning(true);
    setStatus('scanning');

    try {
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      const payload = tag?.ndefMessage?.[0]?.payload;
      if (!payload) throw new Error('No data on card');

      // Try different decoding methods
      let nfcUid = '';

      // Method 1: slice 3 bytes (standard NDEF text record)
      try {
        nfcUid = String.fromCharCode(...payload.slice(3)).trim();
      } catch(e) {}

      // If empty or invalid, try slice 1
      if (!nfcUid || nfcUid.length < 3) {
        try {
          nfcUid = String.fromCharCode(...payload.slice(1)).trim();
        } catch(e) {}
      }

      // If still empty, try full payload
      if (!nfcUid || nfcUid.length < 3) {
        nfcUid = String.fromCharCode(...payload).trim();
      }

      // Clean up any non-printable characters
      nfcUid = nfcUid.replace(/[^\x20-\x7E]/g, '').trim();

      if (!nfcUid) throw new Error('Could not decode card data');

      setStatus('found');
      setScanning(false);

      // Fetch patient from Django
      const baseUrl = await getApiUrl();
      const response = await fetch(
        `${baseUrl}/patient/api/${nfcUid}/`
      );
      const data = await response.json();

      if (data.found) {
        router.push({
          pathname: '/profile',
          params: { patient: JSON.stringify(data) }
        });
      } else {
        Alert.alert('Not Found', 'No patient registered with this card.');
        setStatus('idle');
      }

    } catch (err) {
      setStatus('error');
      Alert.alert('Scan Failed', 'Could not read card. Try again.');
      setTimeout(() => setStatus('idle'), 2000);
    } finally {
      setScanning(false);
      NfcManager.cancelTechnologyRequest();
    }
  }

  const ringColor = {
    idle:     '#00c9a7',
    scanning: '#f5a623',
    found:    '#00c9a7',
    error:    '#f05252',
  }[status];

  const statusText = {
    idle:     'Waiting for card...',
    scanning: 'Hold card to phone...',
    found:    'Card detected!',
    error:    'Scan failed — try again',
  }[status];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>UHC Health Card</Text>
          <Text style={styles.headerSub}>Universal Health Card System</Text>
        </View>

        {/* NFC Ring */}
        <View style={styles.scanCenter}>
          <Animated.View style={[
            styles.outerRing,
            { borderColor: ringColor, transform: [{ scale: pulseAnim }] }
          ]}>
            <View style={[styles.innerRing, { borderColor: ringColor }]}>
              <Text style={styles.nfcIcon}>📲</Text>
            </View>
          </Animated.View>

          <Text style={styles.scanTitle}>
            {scanning ? 'Scanning...' : 'Tap Your Health Card'}
          </Text>
          <Text style={styles.scanSub}>
            Hold your NFC health card{'\n'}against the back of your phone
          </Text>

          {/* Status pill */}
          <View style={[styles.statusPill, {
            backgroundColor: ringColor + '22',
            borderColor: ringColor,
          }]}>
            <View style={[styles.statusDot, { backgroundColor: ringColor }]} />
            <Text style={[styles.statusText, { color: ringColor }]}>
              {statusText}
            </Text>
          </View>

          {/* Scan Button */}
          {!scanning && (
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={startScan}
            >
              <Text style={styles.scanBtnText}>Press to Scan</Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* PIN Login */}
          <TouchableOpacity
            style={styles.pinBtn}
            onPress={() => router.push('/pinlogin')}
          >
            <Text style={styles.pinBtnText}>Use PIN Instead</Text>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() => router.push('/setup')}
          >
            <Text style={styles.setupBtnText}>+ Register New Health Card</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Text style={styles.footer}>⚙️ Settings · Secure · NFC Powered</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerTitle: {
    fontSize: 22, fontWeight: '700',
    color: '#dce4f5', letterSpacing: 0.5,
  },
  headerSub: { fontSize: 13, color: '#8b96b0', marginTop: 4 },
  scanCenter: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  outerRing: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 2, alignItems: 'center',
    justifyContent: 'center', marginBottom: 32,
  },
  innerRing: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  nfcIcon: { fontSize: 52 },
  scanTitle: {
    fontSize: 22, fontWeight: '700',
    color: '#dce4f5', marginBottom: 10,
  },
  scanSub: {
    fontSize: 14, color: '#8b96b0',
    textAlign: 'center', lineHeight: 22, marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, marginBottom: 24, gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  scanBtn: {
    backgroundColor: '#00c9a7', paddingHorizontal: 40,
    paddingVertical: 16, borderRadius: 14,
    width: '100%', alignItems: 'center', marginBottom: 16,
  },
  scanBtnText: { color: '#07090f', fontWeight: '700', fontSize: 16 },
  divider: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', marginBottom: 12, gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1f2638' },
  dividerText: { color: '#4a5470', fontSize: 13 },
  pinBtn: {
    borderWidth: 1, borderColor: '#00c9a7',
    paddingVertical: 14, borderRadius: 14,
    width: '100%', alignItems: 'center', marginBottom: 10,
  },
  pinBtnText: { color: '#00c9a7', fontWeight: '600', fontSize: 15 },
  setupBtn: {
    borderWidth: 1, borderColor: '#1f2638',
    paddingVertical: 14, borderRadius: 14,
    width: '100%', alignItems: 'center',
  },
  setupBtnText: { color: '#8b96b0', fontWeight: '600', fontSize: 15 },
  footer: {
    textAlign: 'center', color: '#4a5470',
    fontSize: 12, paddingBottom: 30,
  },
});