import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen({ route }) {
  const params = route.params;
  const patient = typeof params.patient === 'string'
    ? JSON.parse(params.patient)
    : params.patient;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('vitals');

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

  const tabs = [
    { key: 'vitals',        label: 'Vitals' },
    { key: 'lab_results',   label: 'Lab' },
    { key: 'imaging',       label: 'Imaging' },
    { key: 'prescriptions', label: 'Rx' },
    { key: 'surgeries',     label: 'Surgery' },
    { key: 'diagnoses',     label: 'Diagnosis' },
  ];

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

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText,
                activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {patient[tab.key]?.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {patient[tab.key].length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'vitals' && (
            <RecordList
              records={patient.vitals}
              empty="No vitals recorded yet"
              renderCard={(item) => (
                <RecordCard
                  title={`BP: ${item.blood_pressure || '-'}`}
                  subtitle={`Dr. ${item.recorded_by__username} · ${formatDate(item.recorded_at)}`}
                  details={[
                    { label: 'Blood Pressure', value: item.blood_pressure },
                    { label: 'Blood Sugar',    value: item.blood_sugar },
                    { label: 'Heart Rate',     value: item.heart_rate },
                    { label: 'Temperature',    value: item.temperature },
                    { label: 'SpO2',           value: item.spo2 },
                    { label: 'Weight',         value: item.weight },
                    { label: 'Recorded By',    value: item.recorded_by__username },
                    { label: 'Date',           value: formatDate(item.recorded_at) },
                  ]}
                />
              )}
            />
          )}

          {activeTab === 'lab_results' && (
            <RecordList
              records={patient.lab_results}
              empty="No lab results yet"
              renderCard={(item) => (
                <RecordCard
                  title={item.test_name}
                  subtitle={`${item.status} · ${formatDate(item.added_at)}`}
                  subtitleColor={statusColor(item.status)}
                  details={[
                    { label: 'Test Name',       value: item.test_name },
                    { label: 'Result',          value: item.result },
                    { label: 'Reference Range', value: item.reference_range },
                    { label: 'Status',          value: item.status },
                    { label: 'Notes',           value: item.notes },
                    { label: 'Added By',        value: item.added_by__username },
                    { label: 'Date',            value: formatDate(item.added_at) },
                  ]}
                />
              )}
            />
          )}

          {activeTab === 'imaging' && (
            <RecordList
              records={patient.imaging}
              empty="No imaging reports yet"
              renderCard={(item) => (
                <RecordCard
                  title={`${item.scan_type} - ${item.body_part}`}
                  subtitle={`Dr. ${item.added_by__username} · ${formatDate(item.added_at)}`}
                  details={[
                    { label: 'Scan Type',  value: item.scan_type },
                    { label: 'Body Part',  value: item.body_part },
                    { label: 'Findings',   value: item.findings },
                    { label: 'Impression', value: item.impression },
                    { label: 'Added By',   value: item.added_by__username },
                    { label: 'Date',       value: formatDate(item.added_at) },
                  ]}
                />
              )}
            />
          )}

          {activeTab === 'prescriptions' && (
            <RecordList
              records={patient.prescriptions}
              empty="No prescriptions yet"
              renderCard={(item) => (
                <RecordCard
                  title={item.medicine}
                  subtitle={`${item.dosage} · ${formatDate(item.added_at)}`}
                  details={[
                    { label: 'Medicine',     value: item.medicine },
                    { label: 'Dosage',       value: item.dosage },
                    { label: 'Duration',     value: item.duration },
                    { label: 'Instructions', value: item.instructions },
                    { label: 'Added By',     value: item.added_by__username },
                    { label: 'Date',         value: formatDate(item.added_at) },
                  ]}
                />
              )}
            />
          )}

          {activeTab === 'surgeries' && (
            <RecordList
              records={patient.surgeries}
              empty="No surgery records yet"
              renderCard={(item) => (
                <RecordCard
                  title={item.procedure}
                  subtitle={`${item.outcome} · ${formatDate(item.surgery_date)}`}
                  subtitleColor={outcomeColor(item.outcome)}
                  details={[
                    { label: 'Procedure',     value: item.procedure },
                    { label: 'Surgery Date',  value: formatDate(item.surgery_date) },
                    { label: 'Surgeon',       value: item.surgeon },
                    { label: 'Outcome',       value: item.outcome },
                    { label: 'Notes',         value: item.notes },
                    { label: 'Added By',      value: item.added_by__username },
                  ]}
                />
              )}
            />
          )}

          {activeTab === 'diagnoses' && (
            <RecordList
              records={patient.diagnoses}
              empty="No diagnoses yet"
              renderCard={(item) => (
                <RecordCard
                  title={item.condition}
                  subtitle={`${item.severity} · ${formatDate(item.added_at)}`}
                  subtitleColor={severityColor(item.severity)}
                  details={[
                    { label: 'Condition', value: item.condition },
                    { label: 'Severity',  value: item.severity },
                    { label: 'Notes',     value: item.notes },
                    { label: 'Added By',  value: item.added_by__username },
                    { label: 'Date',      value: formatDate(item.added_at) },
                  ]}
                />
              )}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helper Components ──

function RecordList({ records, empty, renderCard }) {
  if (!records || records.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{empty}</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {records.map((item, i) => (
        <View key={i}>{renderCard(item)}</View>
      ))}
    </View>
  );
}

function RecordCard({ title, subtitle, subtitleColor, details }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.recordHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.recordTitle}>{title}</Text>
          <Text style={[styles.recordSubtitle,
            subtitleColor && { color: subtitleColor }]}>
            {subtitle}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {expanded && (
        <View style={styles.recordDetails}>
          <View style={styles.detailDivider} />
          {details.map((d, i) => d.value ? (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{d.label}</Text>
              <Text style={styles.detailValue}>{d.value}</Text>
            </View>
          ) : null)}
        </View>
      )}
    </TouchableOpacity>
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

// ── Helper Functions ──

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function statusColor(status) {
  if (status === 'Critical') return '#f05252';
  if (status === 'High')     return '#f5a623';
  if (status === 'Low')      return '#f5a623';
  return '#00c9a7';
}

function outcomeColor(outcome) {
  if (outcome === 'Complicated')       return '#f05252';
  if (outcome === 'Ongoing Recovery')  return '#f5a623';
  return '#00c9a7';
}

function severityColor(severity) {
  if (severity === 'Chronic')  return '#f05252';
  if (severity === 'Severe')   return '#f05252';
  if (severity === 'Moderate') return '#f5a623';
  return '#00c9a7';
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
  tabsScroll: { marginBottom: 16 },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: '#1f2638', marginRight: 8,
    backgroundColor: '#121620', gap: 6,
  },
  tabActive: { backgroundColor: '#00c9a7', borderColor: '#00c9a7' },
  tabText: { color: '#8b96b0', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#07090f' },
  tabBadge: {
    backgroundColor: '#1f2638',
    borderRadius: 10, paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeText: { color: '#8b96b0', fontSize: 10, fontWeight: '700' },
  tabContent: { marginBottom: 20 },
  emptyWrap: {
    padding: 32, alignItems: 'center',
    backgroundColor: '#121620', borderRadius: 14,
    borderWidth: 1, borderColor: '#1f2638',
  },
  emptyText: { color: '#4a5470', fontSize: 14 },
  recordCard: {
    backgroundColor: '#121620', borderWidth: 1,
    borderColor: '#1f2638', borderRadius: 14, padding: 16,
  },
  recordHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  recordTitle: {
    fontSize: 15, fontWeight: '600',
    color: '#dce4f5', marginBottom: 4,
  },
  recordSubtitle: { fontSize: 12, color: '#8b96b0' },
  expandIcon: { color: '#4a5470', fontSize: 12, paddingLeft: 8 },
  recordDetails: { marginTop: 8 },
  detailDivider: {
    height: 1, backgroundColor: '#1f2638', marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8, gap: 10,
  },
  detailLabel: {
    fontSize: 12, color: '#8b96b0',
    textTransform: 'uppercase', flex: 1,
  },
  detailValue: {
    fontSize: 13, color: '#dce4f5',
    fontWeight: '500', flex: 2, textAlign: 'right',
  },
});