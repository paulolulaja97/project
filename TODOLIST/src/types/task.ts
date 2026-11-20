// src/types/task.ts
//
// This type mirrors the Python task dict exactly:
//   task = {
//     "id": int,
//     "task": str,
//     "is_active": bool,
//     "starting_date": datetime,
//     "due_date": datetime,
//     "duetime": time,
//     "status": "pending" | "completed",
//   }
//
// In TypeScript we store datetimes as ISO strings at rest (same as the Python
// json.dump with default=datetime_convertion which calls .isoformat()) and
// convert to Date objects at runtime. See src/lib/datetime.ts.

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  task: string;
  is_active: boolean;
  /** ISO string from datetime.now().isoformat() at creation time */
  starting_date: string;
  /** ISO string from datetime.strptime(input, "%d/%m/%Y").isoformat() */
  due_date: string;
  /** ISO string from datetime.strptime(input, "%H:%M").time().isoformat() -> "HH:MM" */
  duetime: string;
  status: TaskStatus;
}

/**
 * The result of the AI analyzing a task to decide notification timing.
 * Stored on the task so we can re-schedule if needed without calling AI again.
 */
export interface AIPhasingInfo {
  /** "high" | "medium" | "low" — AI's read of how urgent the task wording is */
  priority: 'high' | 'medium' | 'low';
  /** minutes before the deadline to fire the heads-up notification */
  lead_time_minutes: number;
  /** short friendly message the AI wrote for the notification body */
  smart_message: string;
}
