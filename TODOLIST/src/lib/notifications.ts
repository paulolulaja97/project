// src/lib/notifications.ts
//
// Local push notification scheduler using expo-notifications.
// Wraps channel creation in try/catch because Expo Go on Android doesn't
// support setNotificationChannelAsync (throws NullPointerException).

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task, AIPhasingInfo } from '../types/task';
import { combine } from './datetime';

const HEADS_UP_ID = (taskId: number) => `todo-headsup-${taskId}`;
const DEADLINE_ID = (taskId: number) => `todo-deadline-${taskId}`;

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;

  // On Android, try to create a notification channel. This throws in Expo Go,
  // so we wrap it in try/catch. Local notifications still work without it.
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('todo-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
      });
    } catch (err) {
      console.warn('Notification channel not created (normal in Expo Go):', err);
    }
  }
  return true;
}

export async function scheduleTaskNotifications(
  task: Task,
  phasing: AIPhasingInfo,
): Promise<void> {
  await cancelTaskNotifications(task.id);

  const deadline = combine(task.due_date, task.duetime);
  const now = new Date();

  const headsUpTime = new Date(deadline.getTime() - phasing.lead_time_minutes * 60 * 1000);
  if (headsUpTime.getTime() > now.getTime()) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Upcoming: ${task.task}`,
          body: phasing.smart_message,
          data: { taskId: task.id, kind: 'headsup' },
        },
        trigger: { date: headsUpTime },
        identifier: HEADS_UP_ID(task.id),
      });
    } catch (err) {
      console.warn('Could not schedule heads-up notification:', err);
    }
  }

  if (deadline.getTime() > now.getTime()) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Due now: ${task.task}`,
          body: `This task is due. Tap to open your to-do list.`,
          data: { taskId: task.id, kind: 'deadline' },
        },
        trigger: { date: deadline },
        identifier: DEADLINE_ID(task.id),
      });
    } catch (err) {
      console.warn('Could not schedule deadline notification:', err);
    }
  }
}

export async function cancelTaskNotifications(taskId: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(HEADS_UP_ID(taskId));
    await Notifications.cancelScheduledNotificationAsync(DEADLINE_ID(taskId));
  } catch (err) {
    console.warn('Could not cancel notifications:', err);
  }
}

export async function rescheduleAll(
  tasks: Task[],
  phasingById: Record<number, AIPhasingInfo>,
): Promise<void> {
  for (const t of tasks) {
    await cancelTaskNotifications(t.id);
  }
  for (const t of tasks) {
    if (!t.is_active || t.status === 'completed') continue;
    const phasing = phasingById[t.id] ?? {
      priority: 'medium' as const,
      lead_time_minutes: 30,
      smart_message: `Heads up: "${t.task}" is due soon.`,
    };
    await scheduleTaskNotifications(t, phasing);
  }
}
