// src/screens/EditTaskScreen.tsx
//
// Mirrors Python's edit_task(). The original lets the user pick:
//   enter 1 to edit task
//   2 to edit due date
//   3 to edit due time
// On mobile we show all three fields at once, pre-filled, and save the ones
// the user changed. The underlying mutation uses Store.edit_task() which is
// the faithful port.

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
import { parseDueDate, parseDueTime, formatDueDate } from '../lib/datetime';
import { EditField } from '../lib/taskStore';

export function EditTaskScreen({ route, navigation }: { route: any; navigation: any }) {
  const { tasks, editTask } = useTodo();
  const taskId = route?.params?.id as number;
  const task = tasks.find((t) => t.id === taskId);

  const [taskText, setTaskText] = useState(task?.task ?? '');
  const [date, setDate] = useState(task ? formatDueDate(task.due_date) : '');
  const [time, setTime] = useState(task?.duetime ?? '');
  const [submitting, setSubmitting] = useState(false);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Task not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!task.is_active) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          this task has been deleted and cannot be edited
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    setSubmitting(true);

    // Apply each field separately so we exercise the same Store.edit_task()
    // mutation as the Python version (which edits one field at a time).
    // We only call edit_task() for fields the user actually changed.
    const changes: { field: EditField; value: string }[] = [];

    if (taskText.trim() !== task.task && taskText.trim() !== '') {
      changes.push({ field: 'task', value: taskText.trim() });
    }

    if (date !== formatDueDate(task.due_date)) {
      try {
        const d = parseDueDate(date);
        changes.push({ field: 'due_date', value: d.toISOString() });
      } catch {
        Alert.alert('Invalid input', 'invalid date\nUse dd/mm/yyyy format');
        setSubmitting(false);
        return;
      }
    }

    if (time !== task.duetime) {
      try {
        const t = parseDueTime(time);
        changes.push({ field: 'duetime', value: t });
      } catch {
        Alert.alert('Invalid input', 'invalid time\nUse HH:MM (24-hour) format');
        setSubmitting(false);
        return;
      }
    }

    if (changes.length === 0) {
      Alert.alert('Nothing to save', 'No fields were changed.');
      setSubmitting(false);
      return;
    }

    for (const c of changes) {
      const res = await editTask(task.id, c.field, c.value);
      if (!res.ok) {
        Alert.alert('Error', res.message);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    Alert.alert('Success', 'eddited successfuly', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Edit Task #{task.id}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Task description</Text>
          <TextInput
            style={styles.input}
            value={taskText}
            onChangeText={setTaskText}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due date (dd/mm/yyyy)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Due time (HH:MM, 24-hour)</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <TouchableOpacity
          style={[styles.submit, submitting && styles.submitDisabled]}
          onPress={handleSave}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Editing the task or deadline makes the AI re-analyze and re-schedule
          notifications.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FA' },
  scroll: { padding: 20, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', marginBottom: 24 },
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
  submit: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  note: { fontSize: 12, color: '#888', marginTop: 14, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#E53935', textAlign: 'center', marginBottom: 16 },
  link: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },
});
