import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView, Alert
} from 'react-native';
import { API_BASE_URL } from '../config';

export default function SetupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    phone: '',
    address: '',
    pin: '',
  });

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    // Validate
    if (!form.name || !form.age || !form.gender || !form.blood_group
      || !form.phone || !form.address || !form.pin) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/patient/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        navigation.navigate('cardready', {
          nfc_uid: data.nfc_uid,
          name: data.name,
        });
      } else {
        Alert.alert('Error', data.message || 'Registration failed.');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not connect to server. Make sure Django is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Health Card</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.subtitle}>
          Enter your details to create your Universal Health Card
        </Text>

        {/* Form */}
        <View style={styles.form}>

          <Field
            label="Full Name *"
            placeholder="e.g. Rahul Menon"
            value={form.name}
            onChangeText={v => updateField('name', v)}
          />

          <Field
            label="Age *"
            placeholder="e.g. 28"
            value={form.age}
            onChangeText={v => updateField('age', v)}
            keyboardType="numeric"
          />

          {/* Gender Selector */}
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.optionRow}>
            {['Male', 'Female', 'Other'].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.optionBtn,
                  form.gender === g && styles.optionBtnActive]}
                onPress={() => updateField('gender', g)}
              >
                <Text style={[styles.optionText,
                  form.gender === g && styles.optionTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Blood Group Selector */}
          <Text style={styles.label}>Blood Group *</Text>
          <View style={styles.optionRow}>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
              <TouchableOpacity
                key={bg}
                style={[styles.optionBtn,
                  form.blood_group === bg && styles.optionBtnActive]}
                onPress={() => updateField('blood_group', bg)}
              >
                <Text style={[styles.optionText,
                  form.blood_group === bg && styles.optionTextActive]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Field
            label="Height (cm)"
            placeholder="e.g. 170"
            value={form.height}
            onChangeText={v => updateField('height', v)}
            keyboardType="numeric"
          />

          <Field
            label="Weight (kg)"
            placeholder="e.g. 65"
            value={form.weight}
            onChangeText={v => updateField('weight', v)}
            keyboardType="numeric"
          />

          <Field
            label="Phone Number *"
            placeholder="e.g. 9876543210"
            value={form.phone}
            onChangeText={v => updateField('phone', v)}
            keyboardType="phone-pad"
          />

          <Field
            label="Address *"
            placeholder="e.g. Kakkanad, Kochi, Kerala"
            value={form.address}
            onChangeText={v => updateField('address', v)}
            multiline
          />

          <Field
            label="Set 4-digit PIN *"
            placeholder="e.g. 1234"
            value={form.pin}
            onChangeText={v => updateField('pin', v)}
            keyboardType="numeric"
          />

        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Creating Card...' : 'Create Health Card'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable input field component
function Field({ label, placeholder, value, onChangeText, keyboardType, multiline }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        placeholder={placeholder}
        placeholderTextColor="#4a5470"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07090f' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: { color: '#00c9a7', fontSize: 15, fontWeight: '600', width: 60 },
  headerTitle: { color: '#dce4f5', fontSize: 18, fontWeight: '700' },
  subtitle: {
    color: '#8b96b0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  form: { gap: 4 },
  fieldWrap: { marginBottom: 16 },
  label: {
    color: '#8b96b0',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#121620',
    borderWidth: 1,
    borderColor: '#1f2638',
    borderRadius: 12,
    padding: 14,
    color: '#dce4f5',
    fontSize: 15,
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2638',
    backgroundColor: '#121620',
  },
  optionBtnActive: {
    backgroundColor: '#00c9a7',
    borderColor: '#00c9a7',
  },
  optionText: {
    color: '#8b96b0',
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#07090f',
  },
  submitBtn: {
    backgroundColor: '#00c9a7',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#1f2638',
  },
  submitBtnText: {
    color: '#07090f',
    fontWeight: '700',
    fontSize: 16,
  },
});