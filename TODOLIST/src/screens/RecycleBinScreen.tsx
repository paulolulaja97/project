// src/screens/RecycleBinScreen.tsx
//
// Mirrors Python's view_recycle_bin(): shows all tasks where is_active is False,
// and lets the user restore one by id.
//
//   for task in tasks_list:
//       if task['is_active']: continue
//       else: print(...)
//   select = int(input("what id did you want to restore "))
//   ... restore_task() ...

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTodo } from '../context/TodoContext';
import { TaskCard } from '../components/TaskCard';
import { recycledTasks } from '../lib/taskStore';

export function RecycleBinScreen({ navigation }: { navigation: any }) {
  const { tasks, restoreTask } = useTodo();
  const recycled = recycledTasks(tasks);

  const handleRestore = useCallback(
    async (id: number) => {
      const res = await restoreTask(id);
      Alert.alert(res.ok ? 'Restored' : 'Cannot restore', res.message);
    },
    [restoreTask],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recycle Bin</Text>
        <Text style={styles.subtitle}>
          {recycled.length} deleted {recycled.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>

      <FlatList
        data={recycled}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => (
          <View>
            <TaskCard task={item} />
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={() => handleRestore(item.id)}
            >
              <Text style={styles.restoreText}>Restore task #{item.id}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Recycle bin is empty</Text>
            <Text style={styles.emptySubtitle}>
              Deleted tasks will appear here and can be restored.
            </Text>
          </View>
        }
        contentContainerStyle={recycled.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FA' },
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  restoreBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  restoreText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' },
  emptyList: { flexGrow: 1 },
});
