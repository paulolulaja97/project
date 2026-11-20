// src/screens/AddTaskScreen.tsx
//
// Mirrors Python's add_task() input flow:
//   - task name (non-empty)
//   - due date in dd/mm/yyyy
//   - due time in HH:MM (24-hour)
//
// The while-True/try-except validation loops from Python are replaced by
// parseDueDate/parseDueTime throwing on bad input, which we catch here and
// show as an inline error.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTodo } from '../context/TodoContext';
import { parseDueDate, parseDueTime } from '../lib/datetime';

export function AddTaskScreen({ navigation }: { navigation: any }) {
  const { addTask } = useTodo();
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // task["task"] == "" check from Python
    if (task.trim() === '') {
      Alert.alert('Invalid input', 'task cannot be empty');
      return;
    }

    let due_date_iso: string;
    let duetime_str: string;
    try {
      // datetime.strptime(user_input, "%d/%m/%Y")
      const d = parseDueDate(date);
      due_date_iso = d.toISOString();
    } catch {
      Alert.alert('Invalid input', 'invalid date\nUse dd/mm/yyyy format');
      return;
    }
    try {
      // datetime.strptime(user_inputs, "%H:%M").time()
      duetime_str = parseDueTime(time);
    } catch {
      Alert.alert('Invalid input', 'invalid time\nUse HH:MM (24-hour) format');
      return;
    }

    setSubmitting(true);
    const res = await addTask(task.trim(), due_date_iso, duetime_str);
    setSubmitting(false);

    Alert.alert(res.ok ? 'Success' : 'Error', res.message, [
      res.ok ? { text: 'OK', onPress: () => navigation.goBack() } : { text: 'OK' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Add Task</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Task description</Text>
          <TextInput
            style={styles.input}
            value={task}
            onChangeText={setTask}
            placeholder="e.g. Submit final report"
            multiline
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due date (dd/mm/yyyy)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 25/12/2026"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due time (HH:MM, 24-hour)</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 14:30"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            The AI will analyze this task and schedule a heads-up notification
            before the deadline. Make sure your Z.ai API key is set in Settings.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submit, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Adding...' : 'Add task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FA' },
  scroll: { padding: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A2E', marginBottom: 24 },
  field: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#1A1A2E',
  },
  hint: {
    backgroundColor: '#EEE9FF',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  hintText: { fontSize: 13, color: '#555', lineHeight: 18 },
  submit: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
