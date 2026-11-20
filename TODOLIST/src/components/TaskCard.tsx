// src/components/TaskCard.tsx
//
// Displays a single task. Mirrors the Python view_task() print format:
//   ID: {id}    Task: {task}  Created: {starting_date}  Due: {due_date} {duetime}  Status: {status}
//   ...and appends "Task overdue" when overdue(task) returns True.
//
// Adds mobile affordances: a "Complete" button and a "Delete" button.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types/task';
import { overdue } from '../lib/taskStore';
import { formatDueDate, formatDateTime } from '../lib/datetime';

interface Props {
  task: Task;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit }: Props) {
  const isOverdue = overdue(task);
  const isCompleted = task.status === 'completed';

  return (
    <View
      style={[
        styles.card,
        isOverdue && styles.cardOverdue,
        isCompleted && styles.cardCompleted,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.id}>#{task.id}</Text>
        <Text
          style={[styles.status, isOverdue && styles.statusOverdue, isCompleted && styles.statusDone]}
        >
          {isCompleted ? 'completed' : isOverdue ? 'overdue' : task.status}
        </Text>
      </View>

      <Text style={styles.taskText}>{task.task}</Text>

      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Due:</Text>
        <Text style={styles.metaValue}>
          {formatDueDate(task.due_date)} at {task.duetime}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Created:</Text>
        <Text style={styles.metaValue}>{formatDateTime(task.starting_date)}</Text>
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => onEdit(task.id)}>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
        )}
        {onComplete && !isCompleted && (
          <TouchableOpacity style={[styles.btn, styles.btnComplete]} onPress={() => onComplete(task.id)}>
            <Text style={styles.btnText}>Complete</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => onDelete(task.id)}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardOverdue: {
    borderLeftColor: '#E53935',
    backgroundColor: '#FFF5F5',
  },
  cardCompleted: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F5FFF5',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  id: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  status: {
    fontSize: 11,
    color: '#6C63FF',
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#EEE9FF',
    overflow: 'hidden',
  },
  statusOverdue: {
    color: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  statusDone: {
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    width: 65,
  },
  metaValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  btnEdit: {
    backgroundColor: '#EEE9FF',
  },
  btnComplete: {
    backgroundColor: '#4CAF50',
  },
  btnDelete: {
    backgroundColor: '#FFEBEE',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
