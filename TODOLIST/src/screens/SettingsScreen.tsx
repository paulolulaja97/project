import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView,
} from 'react-native';
import {
  getApiKey, saveApiKey, clearApiKey,
  getProvider, saveProvider,
  getDefaultLeadTime, saveDefaultLeadTime,
  PROVIDERS, Provider,
} from '../lib/ai';

const LEAD_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '3 hours', value: 180 },
  { label: '1 day', value: 1440 },
];

export function SettingsScreen() {
  const [key, setKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>('zai');
  const [leadTime, setLeadTime] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setProvider(await getProvider());
      setSavedKey(await getApiKey());
      setLeadTime(await getDefaultLeadTime());
    })();
  }, []);

  const handleProviderChange = async (p: Provider) => {
    setProvider(p);
    await saveProvider(p);
    setSavedKey(null);
  };

  const handleLeadTimeChange = async (value: number) => {
    setLeadTime(value);
    await saveDefaultLeadTime(value);
    Alert.alert('Saved', `Reminders will fire ${value < 60 ? value + ' minutes' : value === 60 ? '1 hour' : value === 1440 ? '1 day' : Math.floor(value/60) + ' hours'} before each task deadline.`);
  };

  const handleSave = async () => {
    if (!key.trim()) { Alert.alert('Invalid input', 'API key cannot be empty'); return; }
    setSaving(true);
    await saveApiKey(key.trim());
    setSavedKey(key.trim());
    setKey('');
    setSaving(false);
    Alert.alert('Saved', `Your ${PROVIDERS[provider].name} API key has been stored securely.`);
  };

  const handleClear = async () => {
    Alert.alert('Clear API key?', 'Reminders will use your default lead time instead of AI-customized timing.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearApiKey(); setSavedKey(null); } },
    ]);
  };

  const config = PROVIDERS[provider];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Reminders & AI configuration</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Reminder Time</Text>
        <Text style={styles.sectionDesc}>
          When AI is unavailable, reminders fire this many minutes before each task deadline. This works without any AI key.
        </Text>
        {LEAD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionRow, leadTime === opt.value && styles.optionRowActive]}
            onPress={() => handleLeadTimeChange(opt.value)}
          >
            <Text style={[styles.optionText, leadTime === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
            <View style={[styles.radio, leadTime === opt.value && styles.radioActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Provider (Optional)</Text>
        <Text style={styles.sectionDesc}>
          AI customizes reminder timing based on task urgency. Without AI, the default time above is used.
        </Text>
        {Object.values(PROVIDERS).map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.providerRow, provider === p.id && styles.providerRowActive]}
            onPress={() => handleProviderChange(p.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.providerName, provider === p.id && styles.providerNameActive]}>
                {p.name}
              </Text>
              <Text style={styles.providerModel}>Model: {p.model}</Text>
            </View>
            <View style={[styles.radio, provider === p.id && styles.radioActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{config.keyLabel}</Text>
        {savedKey ? (
          <Text style={styles.savedValue}>Key is set ({savedKey.slice(0, 4)}...{savedKey.slice(-4)})</Text>
        ) : (
          <Text style={[styles.savedValue, { color: '#E53935' }]}>Not configured</Text>
        )}
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={setKey}
          placeholder={`Paste your ${config.keyLabel} here`}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={saving}>
          <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save key'}</Text>
        </TouchableOpacity>
        {savedKey && (
          <TouchableOpacity style={[styles.btn, styles.btnClear]} onPress={handleClear}>
            <Text style={styles.btnTextClear}>Clear stored key</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => Linking.openURL(config.keyUrl)}>
          <Text style={styles.link}>Get a {config.name} API key</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important: Build a standalone APK</Text>
        <Text style={styles.sectionDesc}>
          Reminders only fire in a standalone app, not in Expo Go. Run:{'\n'}
          npm install -g eas-cli{'\n'}
          eas login{'\n'}
          eas build --platform android --profile preview{'\n\n'}
          This creates an APK you install directly — notifications ring like an alarm.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FA' },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  sectionDesc: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 12 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 8 },
  optionRowActive: { borderColor: '#6C63FF', backgroundColor: '#EEE9FF' },
  optionText: { fontSize: 15, color: '#333' },
  optionTextActive: { color: '#6C63FF', fontWeight: '600' },
  providerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 8 },
  providerRowActive: { borderColor: '#6C63FF', backgroundColor: '#EEE9FF' },
  providerName: { fontSize: 15, fontWeight: '600', color: '#333' },
  providerNameActive: { color: '#6C63FF' },
  providerModel: { fontSize: 12, color: '#888', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCC' },
  radioActive: { borderColor: '#6C63FF', backgroundColor: '#6C63FF' },
  savedValue: { fontSize: 13, color: '#4CAF50', fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: '#F5F5FA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 12, color: '#1A1A2E' },
  btn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  btnSave: { backgroundColor: '#6C63FF' },
  btnClear: { backgroundColor: '#FFEBEE' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnTextClear: { color: '#E53935', fontSize: 15, fontWeight: '600' },
  link: { color: '#6C63FF', fontSize: 14, fontWeight: '600', marginTop: 4 },
});
