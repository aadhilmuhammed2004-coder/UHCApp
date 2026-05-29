import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width - 40;

export default function MedicalVaultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patient = typeof params.patient === 'string'
    ? JSON.parse(params.patient)
    : params.patient;

  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('vitals');

  // Animations
  const lockScale = useRef(new Animated.Value(1)).current;
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const vaultOpacity = useRef(new Animated.Value(0)).current;
  const vaultTranslate = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow pulse on lock icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1, duration: 1500, useNativeDriver: true
        }),
        Animated.timing(glowAnim, {
          toValue: 0, duration: 1500, useNativeDriver: true
        }),
      ])
    ).start();
  }, []);

  async function handleAuth() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        unlockVault();
        return;
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasBiometric =
        supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) ||
        supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

      if (!hasBiometric) {
        Alert.alert('Biometric Not Available',
          'No fingerprint or face ID is set up on this device. Please enroll a biometric in your device settings.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Scan fingerprint or face to access Medical Vault',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        requireConfirmation: false,
      });

      if (result.success) {
        unlockVault();
      } else {
        setAuthError('Fingerprint not recognized. Try again.');
      }
    } catch (err) {
      setAuthError('Authentication error. Try again.');
    }
  }

  function unlockVault() {
    // Lock breaks open animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(lockScale, {
          toValue: 1.3, duration: 200, useNativeDriver: true
        }),
      ]),
      Animated.parallel([
        Animated.timing(lockScale, {
          toValue: 0, duration: 300, useNativeDriver: true
        }),
        Animated.timing(lockOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true
        }),
      ]),
    ]).start(() => {
      setAuthenticated(true);
      Animated.parallel([
        Animated.timing(vaultOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true
        }),
        Animated.timing(vaultTranslate, {
          toValue: 0, duration: 500, useNativeDriver: true
        }),
      ]).start();
    });
  }

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1f2638', '#00c9a7'],
  });

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

      {!authenticated ? (
        // ── LOCK SCREEN ──
        <View style={styles.lockContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.lockCenter}>
            <Animated.View style={[
              styles.lockGlow,
              { borderColor: glowColor }
            ]}>
              <Animated.Text style={[
                styles.lockIcon,
                { transform: [{ scale: lockScale }], opacity: lockOpacity }
              ]}>
                🔒
              </Animated.Text>
            </Animated.View>

            <Text style={styles.vaultTitle}>Medical Vault</Text>
            <Text style={styles.vaultSub}>
              {patient.name}'s protected health records
            </Text>
            <Text style={styles.vaultSub2}>
              Fingerprint or face authentication required
            </Text>

            {authError ? (
              <Text style={styles.authError}>{authError}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.authBtn}
              onPress={handleAuth}
            >
              <Text style={styles.authBtnIcon}>👆</Text>
              <Text style={styles.authBtnText}>Touch to Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>

      ) : (
        // ── VAULT CONTENT ──
        <Animated.View style={[
          { flex: 1 },
          { opacity: vaultOpacity, transform: [{ translateY: vaultTranslate }] }
        ]}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backBtn}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.vaultHeader}>
                <Text style={styles.vaultHeaderIcon}>🔓</Text>
                <Text style={styles.vaultHeaderTitle}>Medical Vault</Text>
              </View>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.patientBadge}>
              <Text style={styles.patientBadgeName}>{patient.name}</Text>
              <Text style={styles.patientBadgeNfc}>{patient.nfc_uid}</Text>
            </View>

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
                <>
                  <VitalsGraph vitals={patient.vitals} />
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
                </>
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
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ── Helper Components ──

function VitalsGraph({ vitals }) {
  const [selectedGraph, setSelectedGraph] = useState('bp');
  if (!vitals || vitals.length < 2) {
    return (
      <View style={styles.graphEmpty}>
        <Text style={styles.graphEmptyText}>
          Need at least 2 vitals entries to show graph
        </Text>
      </View>
    );
  }
  const reversed = [...vitals].reverse();
  const graphData = {
    bp:     { label: 'Blood Pressure', color: '#f05252', data: reversed.map(v => parseInt(v.blood_pressure?.split('/')[0]) || 0) },
    sugar:  { label: 'Blood Sugar',    color: '#f5a623', data: reversed.map(v => parseFloat(v.blood_sugar) || 0) },
    hr:     { label: 'Heart Rate',     color: '#3d8ef8', data: reversed.map(v => parseFloat(v.heart_rate) || 0) },
    spo2:   { label: 'SpO2',           color: '#00c9a7', data: reversed.map(v => parseFloat(v.spo2) || 0) },
    weight: { label: 'Weight',         color: '#a855f7', data: reversed.map(v => parseFloat(v.weight) || 0) },
  };
  const labels = reversed.map(v => {
    const d = new Date(v.recorded_at);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const current = graphData[selectedGraph];
  const graphBtns = [
    { key: 'bp', label: 'BP' }, { key: 'sugar', label: 'Sugar' },
    { key: 'hr', label: 'HR' }, { key: 'spo2',  label: 'SpO2' },
    { key: 'weight', label: 'Weight' },
  ];
  return (
    <View style={styles.graphCard}>
      <Text style={styles.graphTitle}>Vitals Trend</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {graphBtns.map(btn => (
          <TouchableOpacity
            key={btn.key}
            style={[styles.graphBtn, selectedGraph === btn.key && { backgroundColor: current.color, borderColor: current.color }]}
            onPress={() => setSelectedGraph(btn.key)}
          >
            <Text style={[styles.graphBtnText, selectedGraph === btn.key && { color: '#07090f' }]}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={[styles.graphLabel, { color: current.color }]}>{current.label}</Text>
      <LineChart
        data={{ labels, datasets: [{ data: current.data }] }}
        width={screenWidth}
        height={200}
        chartConfig={{
          backgroundColor: '#121620', backgroundGradientFrom: '#121620',
          backgroundGradientTo: '#121620', decimalPlaces: 0,
          color: () => current.color, labelColor: () => '#8b96b0',
          propsForDots: { r: '5', strokeWidth: '2', stroke: current.color },
          propsForBackgroundLines: { stroke: '#1f2638' },
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}

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
    <TouchableOpacity style={styles.recordCard} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.recordHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.recordTitle}>{title}</Text>
          <Text style={[styles.recordSubtitle, subtitleColor && { color: subtitleColor }]}>{subtitle}</Text>
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

// ── Helper Functions ──
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function statusColor(s) {
  if (s === 'Critical') return '#f05252';
  if (s === 'High' || s === 'Low') return '#f5a623';
  return '#00c9a7';
}
function outcomeColor(o) {
  if (o === 'Complicated') return '#f05252';
  if (o === 'Ongoing Recovery') return '#f5a623';
  return '#00c9a7';
}
function severityColor(s) {
  if (s === 'Chronic' || s === 'Severe') return '#f05252';
  if (s === 'Moderate') return '#f5a623';
  return '#00c9a7';
}

// ── Styles ──
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 20 },
  lockContainer: { flex: 1, paddingHorizontal: 24 },
  backWrap: { paddingTop: 16, paddingBottom: 8 },
  backBtn: { color: '#00c9a7', fontSize: 15, fontWeight: '600' },
  lockCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lockGlow: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  lockIcon: { fontSize: 64 },
  vaultTitle: { fontSize: 28, fontWeight: '800', color: '#dce4f5', marginBottom: 8 },
  vaultSub: { fontSize: 14, color: '#8b96b0', textAlign: 'center', marginBottom: 4 },
  vaultSub2: { fontSize: 13, color: '#4a5470', textAlign: 'center', marginBottom: 32 },
  authError: { fontSize: 13, color: '#f05252', marginBottom: 16 },
  authBtn: {
    backgroundColor: '#121620', borderWidth: 1, borderColor: '#00c9a7',
    borderRadius: 20, paddingHorizontal: 32, paddingVertical: 16,
    alignItems: 'center', flexDirection: 'row', gap: 12,
  },
  authBtnIcon: { fontSize: 24 },
  authBtnText: { color: '#00c9a7', fontWeight: '700', fontSize: 16 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 16, paddingBottom: 12,
  },
  vaultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vaultHeaderIcon: { fontSize: 20 },
  vaultHeaderTitle: { color: '#00c9a7', fontSize: 16, fontWeight: '700' },
  patientBadge: {
    backgroundColor: '#121620', borderWidth: 1, borderColor: '#1f2638',
    borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16,
  },
  patientBadgeName: { color: '#dce4f5', fontSize: 16, fontWeight: '700' },
  patientBadgeNfc: { color: '#8b96b0', fontSize: 12, marginTop: 2 },
  tabsScroll: { marginBottom: 16 },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#1f2638',
    marginRight: 8, backgroundColor: '#121620', gap: 6,
  },
  tabActive: { backgroundColor: '#00c9a7', borderColor: '#00c9a7' },
  tabText: { color: '#8b96b0', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#07090f' },
  tabBadge: { backgroundColor: '#1f2638', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { color: '#8b96b0', fontSize: 10, fontWeight: '700' },
  tabContent: { marginBottom: 20 },
  emptyWrap: {
    padding: 32, alignItems: 'center',
    backgroundColor: '#121620', borderRadius: 14, borderWidth: 1, borderColor: '#1f2638',
  },
  emptyText: { color: '#4a5470', fontSize: 14 },
  recordCard: { backgroundColor: '#121620', borderWidth: 1, borderColor: '#1f2638', borderRadius: 14, padding: 16 },
  recordHeader: { flexDirection: 'row', alignItems: 'center' },
  recordTitle: { fontSize: 15, fontWeight: '600', color: '#dce4f5', marginBottom: 4 },
  recordSubtitle: { fontSize: 12, color: '#8b96b0' },
  expandIcon: { color: '#4a5470', fontSize: 12, paddingLeft: 8 },
  recordDetails: { marginTop: 8 },
  detailDivider: { height: 1, backgroundColor: '#1f2638', marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 10 },
  detailLabel: { fontSize: 12, color: '#8b96b0', textTransform: 'uppercase', flex: 1 },
  detailValue: { fontSize: 13, color: '#dce4f5', fontWeight: '500', flex: 2, textAlign: 'right' },
  graphCard: { backgroundColor: '#121620', borderWidth: 1, borderColor: '#1f2638', borderRadius: 14, padding: 16, marginBottom: 16 },
  graphTitle: { fontSize: 14, fontWeight: '700', color: '#dce4f5', marginBottom: 12 },
  graphLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  graphBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1f2638', marginRight: 8, backgroundColor: '#121620' },
  graphBtnText: { color: '#8b96b0', fontSize: 12, fontWeight: '600' },
  graphEmpty: { backgroundColor: '#121620', borderWidth: 1, borderColor: '#1f2638', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16 },
  graphEmptyText: { color: '#4a5470', fontSize: 13, textAlign: 'center' },
});
