import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CardReadyScreen({ route }) {
  const { nfc_uid, name } = route.params;
  const router = useRouter();

  async function goHome() {
    try {
      await AsyncStorage.setItem('nfc_uid', nfc_uid);
      await AsyncStorage.setItem('patient_name', name);
      router.replace('/scan');
    } catch (e) {
      router.replace('/scan');
    }
  }

  function copyUID() {
    Alert.alert('Your NFC ID', `Your ID is: ${nfc_uid}\n\nWrite this to your NFC card using NFC Tools app.`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Card Created!</Text>
          <Text style={styles.successSub}>
            Welcome, {name}!{'\n'}
            Your Universal Health Card is ready.
          </Text>
        </View>

        {/* NFC UID Box */}
        <View style={styles.uidCard}>
          <Text style={styles.uidLabel}>YOUR NFC CARD ID</Text>
          <Text style={styles.uidValue}>{nfc_uid}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyUID}>
            <Text style={styles.copyBtnText}>Copy ID</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>
            How to write this ID to your NFC card
          </Text>

          {[
            'Download NFC Tools app from Play Store',
            'Open NFC Tools → tap Write',
            'Tap Add a record → choose Text',
            `Type your ID: ${nfc_uid}`,
            'Tap Write / 1 record → hold NFC card to back of phone',
            'Done! Your card is ready to use',
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Go Home button */}
        <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
          <Text style={styles.homeBtnText}>Go to My Health Card</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 20 },
  successWrap: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0d2e1f',
    borderWidth: 2,
    borderColor: '#00c9a7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: { fontSize: 40, color: '#00c9a7' },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#dce4f5',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: '#8b96b0',
    textAlign: 'center',
    lineHeight: 22,
  },
  uidCard: {
    backgroundColor: '#121620',
    borderWidth: 1,
    borderColor: '#00c9a7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  uidLabel: {
    fontSize: 11,
    color: '#8b96b0',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  uidValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00c9a7',
    letterSpacing: 2,
    marginBottom: 16,
  },
  copyBtn: {
    backgroundColor: '#0d2e1f',
    borderWidth: 1,
    borderColor: '#00c9a7',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyBtnText: {
    color: '#00c9a7',
    fontWeight: '600',
    fontSize: 14,
  },
  instructionsCard: {
    backgroundColor: '#121620',
    borderWidth: 1,
    borderColor: '#1f2638',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    color: '#dce4f5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00c9a7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: {
    color: '#07090f',
    fontWeight: '700',
    fontSize: 13,
  },
  stepText: {
    color: '#8b96b0',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  homeBtn: {
    backgroundColor: '#00c9a7',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#07090f',
    fontWeight: '700',
    fontSize: 16,
  },
});