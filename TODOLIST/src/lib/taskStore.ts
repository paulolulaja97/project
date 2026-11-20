// src/lib/taskStore.ts
//
// FAITHFUL PORT of the Python to-do list algorithm.
//
// Every function below mirrors a Python function 1:1. The only changes are:
//   - input()/print() replaced with function parameters and return values
//   - while True input loops removed (the UI handles retries)
//   - datetime objects replaced with ISO strings (see storage.ts / datetime.ts)
//
// The core logic — id auto-increment, is_active soft-delete, status field,
// overdue check via combine(due_date.date(), duetime) — is preserved exactly.

import { Task, TaskStatus } from '../types/task';
import { combine } from './datetime';

/**
 * Port of overdue(task):
 *
 *   current_time = datetime.now()
 *   deadline = datetime.combine(task['due_date'].date(), task['duetime'])
 *   if task['status'] == "completed": return False
 *   elif not task['is_active']: return False
 *   elif current_time > deadline: return True
 *   else: return False
 */
export function overdue(task: Task): boolean {
  // current_time = datetime.now()
  const current_time = new Date();
  // deadline = datetime.combine(task['due_date'].date(), task['duetime'])
  const deadline = combine(task.due_date, task.duetime);

  if (task.status === 'completed') return false;        // if task['status'] == "completed": return False
  else if (!task.is_active) return false;                // elif not task['is_active']: return False
  else if (current_time.getTime() > deadline.getTime()) // elif current_time > deadline: return True
    return true;
  else return false;                                     // else: return False
}

/**
 * Port of the id assignment inside add_task():
 *
 *   if len(tasks_list) > 0:
 *       task["id"] = tasks_list[-1]["id"] + 1
 *   else:
 *       task["id"] = 1
 */
export function nextId(tasks_list: Task[]): number {
  if (tasks_list.length > 0) {
    return tasks_list[tasks_list.length - 1].id + 1;
  }
  return 1;
}

/**
 * Port of add_task() — the core creation logic, minus the input() loops.
 *
 * Original Python:
 *   task["task"] = <user input, non-empty>
 *   task["is_active"] = True
 *   task["starting_date"] = datetime.now()
 *   task["due_date"] = datetime.strptime(user_input, "%d/%m/%Y")
 *   task["duetime"] = datetime.strptime(user_inputs, "%H:%M").time()
 *   task["status"] = "pending"
 *   task["id"] = tasks_list[-1]["id"] + 1 if tasks_list else 1
 *   tasks_list.append(task)
 *   saved_tasks()
 *
 * Inputs here are already-parsed values (the UI does the parsing/validation
 * that the while-True/try-except loops did in Python).
 */
export function buildTask(
  tasks_list: Task[],
  description: string,
  due_date_iso: string,  // ISO string from parseDueDate(...).toISOString()
  duetime_str: string,   // "HH:MM" from parseDueTime(...)
): Task {
  const task: Task = {
    task: description,
    is_active: true,
    starting_date: new Date().toISOString(), // datetime.now()
    due_date: due_date_iso,
    duetime: duetime_str,
    status: 'pending',
    id: nextId(tasks_list),
  };
  return task;
}

/**
 * Port of completed_task() — the mutation core, minus the input/print loop.
 *
 * Original Python:
 *   for i in tasks_list:
 *       if user_choise == i['id']:
 *           if not i['is_active']: print("Task already deleted"); return
 *           elif i['status'] == "completed": print("this task is completed"); return
 *           else:
 *               i['status'] = "completed"
 *               saved_tasks()
 *               return
 *
 * Returns a result describing what happened, so the UI can show the same
 * messages the Python print() calls did.
 */
export type CompleteResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function completed_task(tasks_list: Task[], user_choise: number): CompleteResult {
  for (const i of tasks_list) {
    if (user_choise === i.id) {
      if (!i.is_active) {
        return { ok: false, message: 'Task already deleted' };
      } else if (i.status === 'completed') {
        return { ok: false, message: 'this task is completed' };
      } else {
        i.status = 'completed';
        return { ok: true, message: 'task completed successfuly' };
      }
    }
  }
  return { ok: false, message: 'Task id not found' };
}

/**
 * Port of delete_a_task() — the mutation core, minus the input/print loop.
 *
 * Original Python:
 *   for i in tasks_list:
 *       if user_choise == i['id']:
 *           if not i['is_active']: print("task already deleted"); return
 *           else:
 *               i['is_active'] = False
 *               print("deleted successfuly")
 *               saved_tasks()
 *               return
 */
export type DeleteResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function delete_a_task(tasks_list: Task[], user_choise: number): DeleteResult {
  for (const i of tasks_list) {
    if (user_choise === i.id) {
      if (!i.is_active) {
        return { ok: false, message: 'task already deleted' };
      } else {
        i.is_active = false;
        return { ok: true, message: 'deleted successfuly' };
      }
    }
  }
  return { ok: false, message: 'task id not found' };
}

/**
 * Port of edit_task() — the mutation core, minus the input/print loop.
 *
 * Original Python supports three edits:
 *   1 -> edit task text
 *   2 -> edit due date (dd/mm/yyyy)
 *   3 -> edit due time (HH:MM)
 *
 * And guards:
 *   if not i['is_active']: print("this task has been deleted and cannot be edited"); return
 */
export type EditField = 'task' | 'due_date' | 'duetime';

export type EditResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function edit_task(
  tasks_list: Task[],
  user_choice: number,
  field: EditField,
  newValue: string, // for 'task' it's the new text; for 'due_date' it's an ISO string; for 'duetime' it's "HH:MM"
): EditResult {
  if (user_choice <= 0) {
    return { ok: false, message: 'fileds cannot be empty' };
  }

  for (const i of tasks_list) {
    if (user_choice === i.id) {
      if (!i.is_active) {
        return { ok: false, message: 'this task has been deleted and cannot be edited' };
      }
      if (field === 'task') {
        if (newValue.trim() === '') {
          return { ok: false, message: 'filed cannot be empty' };
        }
        i.task = newValue;
        return { ok: true, message: 'eddited successfuly' };
      }
      if (field === 'due_date') {
        i.due_date = newValue; // ISO string
        return { ok: true, message: 'eddited successfuly' };
      }
      if (field === 'duetime') {
        i.duetime = newValue; // "HH:MM"
        return { ok: true, message: 'eddited successfuly' };
      }
    }
  }
  return { ok: false, message: 'task id not found' };
}

/**
 * Port of the restore branch inside view_recycle_bin():
 *
 *   for i in tasks_list:
 *       if select == i["id"]:
 *           if i['is_active']: print("Id not in recycle bin"); break
 *           else:
 *               i['is_active'] = True
 *               print("Restoration complete")
 *               saved_tasks()
 *               return
 */
export type RestoreResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function restore_task(tasks_list: Task[], select: number): RestoreResult {
  for (const i of tasks_list) {
    if (select === i.id) {
      if (i.is_active) {
        return { ok: false, message: 'Id not in recycle bin' };
      } else {
        i.is_active = true;
        return { ok: true, message: 'Restoration complete' };
      }
    }
  }
  return { ok: false, message: 'Task id not found' };
}

/**
 * Helper that mirrors the Python view_task() filter — "show active tasks".
 * (Python skips tasks where not task["is_active"].)
 */
export function activeTasks(tasks_list: Task[]): Task[] {
  return tasks_list.filter((t) => t.is_active);
}

/**
 * Helper that mirrors the Python view_recycle_bin() filter — "show inactive tasks".
 */
export function recycledTasks(tasks_list: Task[]): Task[] {
  return tasks_list.filter((t) => !t.is_active);
}
