import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Task, AIPhasingInfo } from '../types/task';
import * as Store from '../lib/taskStore';
import { saved_tasks, load_task } from '../lib/storage';
import { analyzeTask, getDefaultLeadTime } from '../lib/ai';
import {
  scheduleTaskNotifications,
  cancelTaskNotifications,
  rescheduleAll,
  requestNotificationPermissions,
} from '../lib/notifications';

interface TodoContextValue {
  tasks: Task[];
  loading: boolean;
  phasing: Record<number, AIPhasingInfo>;
  addTask: (description: string, due_date_iso: string, duetime_str: string) => Promise<{ ok: boolean; message: string }>;
  completeTask: (id: number) => Promise<{ ok: boolean; message: string }>;
  deleteTask: (id: number) => Promise<{ ok: boolean; message: string }>;
  editTask: (id: number, field: Store.EditField, newValue: string) => Promise<{ ok: boolean; message: string }>;
  restoreTask: (id: number) => Promise<{ ok: boolean; message: string }>;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodo must be used inside TodoProvider');
  return ctx;
}

async function getFallback(taskName: string): Promise<AIPhasingInfo> {
  const leadTime = await getDefaultLeadTime();
  return {
    priority: 'medium',
    lead_time_minutes: leadTime,
    smart_message: `Heads up: "${taskName}" is due soon.`,
  };
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phasing, setPhasing] = useState<Record<number, AIPhasingInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await load_task();
      setTasks(loaded);
      await requestNotificationPermissions();
      await rescheduleAll(loaded, {});
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: Task[]) => {
    setTasks(next);
    await saved_tasks(next);
  }, []);

  const addTask = useCallback(
    async (description: string, due_date_iso: string, duetime_str: string) => {
      if (!description.trim()) return { ok: false, message: 'task cannot be empty' };
      const newTask = Store.buildTask(tasks, description, due_date_iso, duetime_str);
      const next = [...tasks, newTask];
      await persist(next);
      try {
        const phasingInfo = await analyzeTask(newTask.task, newTask.due_date);
        setPhasing((p) => ({ ...p, [newTask.id]: phasingInfo }));
        await scheduleTaskNotifications(newTask, phasingInfo);
      } catch (err) {
        const fallback = await getFallback(newTask.task);
        setPhasing((p) => ({ ...p, [newTask.id]: fallback }));
        await scheduleTaskNotifications(newTask, fallback);
      }
      return { ok: true, message: 'Task added succefully' };
    },
    [tasks, persist],
  );

  const completeTask = useCallback(
    async (id: number) => {
      const next = tasks.map((t) => ({ ...t }));
      const result = Store.completed_task(next, id);
      if (result.ok) {
        await persist(next);
        await cancelTaskNotifications(id);
      }
      return result;
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    async (id: number) => {
      const next = tasks.map((t) => ({ ...t }));
      const result = Store.delete_a_task(next, id);
      if (result.ok) {
        await persist(next);
        await cancelTaskNotifications(id);
      }
      return result;
    },
    [tasks, persist],
  );

  const editTask = useCallback(
    async (id: number, field: Store.EditField, newValue: string) => {
      const next = tasks.map((t) => ({ ...t }));
      const result = Store.edit_task(next, id, field, newValue);
      if (result.ok) {
        await persist(next);
        const edited = next.find((t) => t.id === id);
        if (edited) {
          try {
            const info = await analyzeTask(edited.task, edited.due_date);
            setPhasing((p) => ({ ...p, [id]: info }));
            await scheduleTaskNotifications(edited, info);
          } catch {
            const fallback = await getFallback(edited.task);
            await scheduleTaskNotifications(edited, fallback);
          }
        }
      }
      return result;
    },
    [tasks, persist],
  );

  const restoreTask = useCallback(
    async (id: number) => {
      const next = tasks.map((t) => ({ ...t }));
      const result = Store.restore_task(next, id);
      if (result.ok) {
        await persist(next);
        const restored = next.find((t) => t.id === id);
        if (restored) {
          const ph = phasing[id] ?? (await getFallback(restored.task));
          await scheduleTaskNotifications(restored, ph);
        }
      }
      return result;
    },
    [tasks, persist, phasing],
  );

  return (
    <TodoContext.Provider
      value={{ tasks, loading, phasing, addTask, completeTask, deleteTask, editTask, restoreTask }}
    >
      {children}
    </TodoContext.Provider>
  );
}
