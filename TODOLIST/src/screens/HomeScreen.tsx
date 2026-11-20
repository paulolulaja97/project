// src/screens/HomeScreen.tsx
//
// Mirrors Python's main_menu option 2 (view_task) and option 3 (completed_task)
// and option 4 (delete_a_task). Shows active tasks with their status and
// overdue flag, with Complete / Edit / Delete buttons.
//
// Also wires the optional AI daily briefing (an addition over the Python CLI).

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTodo } from '../context/TodoContext';
import { TaskCard } from '../components/TaskCard';
import { activeTasks } from '../lib/taskStore';
import { dailyBriefing } from '../lib/ai';
import { hasApiKey } from '../lib/ai';

export function HomeScreen({ navigation }: { navigation: any }) {
  const { tasks, loading, completeTask, deleteTask, phasing } = useTodo();
  const [refreshing, setRefreshing] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const active = activeTasks(tasks);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setBriefing(null);
    setRefreshing(false);
  }, []);

  const handleComplete = useCallback(
    async (id: number) => {
      const res = await completeTask(id);
      Alert.alert(res.ok ? 'Done' : 'Cannot complete', res.message);
    },
    [completeTask],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      Alert.alert('Delete task?', 'This moves the task to the recycle bin.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteTask(id);
            Alert.alert(res.ok ? 'Deleted' : 'Cannot delete', res.message);
          },
        },
      ]);
    },
    [deleteTask],
  );

  const handleEdit = useCallback(
    (id: number) => {
      navigation.navigate('EditTask', { id });
    },
    [navigation],
  );

  const handleBriefing = useCallback(async () => {
    setBriefingLoading(true);
    try {
      const ok = await hasApiKey();
      if (!ok) {
        Alert.alert(
          'No API key',
          'Add your Z.ai API key in Settings to use the AI briefing.',
        );
        setBriefingLoading(false);
        return;
      }
      const text = await dailyBriefing(
        active.map((t) => ({
          task: t.task,
          due_date: t.due_date,
          duetime: t.duetime,
          status: t.status,
        })),
      );
      setBriefing(text);
    } catch (err: any) {
      Alert.alert('AI error', err?.message ?? 'Failed to get briefing');
    } finally {
      setBriefingLoading(false);
    }
  }, [active]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>
          {active.length} active {active.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.briefingBtn}
        onPress={handleBriefing}
        disabled={briefingLoading || active.length === 0}
      >
        <Text style={styles.briefingBtnText}>
          {briefingLoading ? 'Asking AI...' : 'Get AI briefing'}
        </Text>
      </TouchableOpacity>

      {briefing && (
        <View style={styles.briefingBox}>
          <Text style={styles.briefingLabel}>AI Briefing</Text>
          <Text style={styles.briefingText}>{briefing}</Text>
        </View>
      )}

      <FlatList
        data={active}
        keyExtractor={(t) => String(t.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View>
            <TaskCard
              task={item}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
            {phasing[item.id] && (
              <View style={styles.aiChipRow}>
                <Text style={styles.aiChip}>
                  AI: {phasing[item.id].priority} priority, alert{' '}
                  {phasing[item.id].lead_time_minutes} min before
                </Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button below to add your first task.
            </Text>
          </View>
        }
        contentContainerStyle={active.length === 0 ? styles.emptyList : undefined}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FA' },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  briefingBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
  },
  briefingBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  briefingBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#EEE9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
  },
  briefingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C63FF',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  briefingText: { fontSize: 14, color: '#333', lineHeight: 20 },
  aiChipRow: { paddingHorizontal: 20, marginBottom: 4 },
  aiChip: {
    fontSize: 11,
    color: '#6C63FF',
    backgroundColor: '#EEE9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' },
  emptyList: { flexGrow: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -3 },
});
