import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen({ route }) {
  const params = route.params;
  const patient = typeof params.patient === 'string'
    ? JSON.parse(params.patient)
    : params.patient;

  const router = useRouter();

  const bmi = patient.height && patient.weight
    ? (parseFloat(patient.weight) /
      Math.pow(parseFloat(patient.height) / 100, 2)).toFixed(1)
    : null;

  const scoreColor = patient.health_score >= 75 ? '#00c9a7'
    : patient.health_score >= 50 ? '#f5a623'
    : '#f05252';

  const scoreLabel = patient.health_score >= 75 ? 'Good'
    : patient.health_score >= 50 ? 'Fair'
    : 'Poor';

  const initials = patient.name
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Health Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientNfc}>NFC ID: {patient.nfc_uid}</Text>
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNum, { color: scoreColor }]}>
              {patient.health_score}
            </Text>
            <Text style={styles.scoreLabel}>Health Score</Text>
            <Text style={[styles.scoreStatus, { color: scoreColor }]}>
              {scoreLabel}
            </Text>
          </View>
        </View>

        {/* Basic Info Grid */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoGrid}>
          <InfoCard label="Age"    value={`${patient.age} yrs`} />
          <InfoCard label="Gender" value={patient.gender} />
          <InfoCard label="Blood"  value={patient.blood_group} />
          <InfoCard label="Phone"  value={patient.phone} />
          <InfoCard label="Height" value={patient.height ? `${patient.height} cm` : '-'} />
          <InfoCard label="Weight" value={patient.weight ? `${patient.weight} kg` : '-'} />
          <InfoCard label="BMI"    value={bmi || '-'} />
          <InfoCard label="Status" value={scoreLabel} color={scoreColor} />
        </View>

        {/* Address */}
        <Text style={styles.sectionTitle}>Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressText}>{patient.address}</Text>
        </View>

        {/* Medical Records */}
        <Text style={styles.sectionTitle}>Medical Records</Text>
        <TouchableOpacity
          style={styles.vaultBtn}
          onPress={() => router.push({
            pathname: '/vault',
            params: { patient: JSON.stringify(patient) }
          })}
        >
          <Text style={styles.vaultBtnIcon}>🔒</Text>
          <View>
            <Text style={styles.vaultBtnTitle}>Open Medical Vault</Text>
            <Text style={styles.vaultBtnSub}>Fingerprint or face ID required</Text>
          </View>
          <Text style={styles.vaultBtnArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 12,
  },
  backBtn: { color: '#00c9a7', fontSize: 15, fontWeight: '600', width: 60 },
  topBarTitle: { color: '#dce4f5', fontSize: 16, fontWeight: '700' },
  profileCard: {
    backgroundColor: '#121620', borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#1f2638', marginBottom: 20,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1e3a5f', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#3d8ef8', fontSize: 26, fontWeight: '700' },
  patientName: {
    fontSize: 22, fontWeight: '700',
    color: '#dce4f5', marginBottom: 4,
  },
  patientNfc: { fontSize: 13, color: '#8b96b0', marginBottom: 16 },
  scoreBadge: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 10, alignItems: 'center',
  },
  scoreNum: { fontSize: 32, fontWeight: '800' },
  scoreLabel: {
    fontSize: 11, color: '#8b96b0',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  scoreStatus: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  sectionTitle: {
    fontSize: 12, color: '#8b96b0',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 10, marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#121620', borderWidth: 1,
    borderColor: '#1f2638', borderRadius: 12,
    padding: 12, width: '47%', alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10, color: '#8b96b0',
    textTransform: 'uppercase', marginBottom: 4,
  },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#dce4f5' },
  addressCard: {
    backgroundColor: '#121620', borderWidth: 1,
    borderColor: '#1f2638', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  addressText: { fontSize: 14, color: '#dce4f5', lineHeight: 22 },
  vaultBtn: {
    backgroundColor: '#121620', borderWidth: 1,
    borderColor: '#00c9a7', borderRadius: 16,
    padding: 20, flexDirection: 'row',
    alignItems: 'center', gap: 16, marginBottom: 20,
  },
  vaultBtnIcon: { fontSize: 32 },
  vaultBtnTitle: { color: '#dce4f5', fontWeight: '700', fontSize: 16 },
  vaultBtnSub: { color: '#8b96b0', fontSize: 12, marginTop: 2 },
  vaultBtnArrow: { color: '#00c9a7', fontSize: 20, marginLeft: 'auto' },
});