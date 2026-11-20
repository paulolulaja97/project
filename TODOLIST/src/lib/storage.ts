// src/lib/storage.ts
//
// Direct port of the Python persistence helpers:
//
//   def saved_tasks():
//       with open("tasks_list.json", "w") as file:
//           json.dump(tasks_list, file, indent=6, default=datetime_convertion)
//
//   def load_task():
//       try:
//           with open("tasks_list.json", "r") as file:
//               tasks_list = json.load(file)
//               for task in tasks_list:
//                   task['due_date'] = datetime_obj_convert(task['due_date'])
//                   task['duetime'] = time_obj_convert(task['duetime'])
//                   task['starting_date'] = datetime_obj_convert(task['starting_date'])
//               return tasks_list
//       except json.decoder.JSONDecodeError: return []
//       except FileNotFoundError: return []
//       except ValueError: return []
//
// On mobile there is no filesystem, so we use AsyncStorage. The shape of the
// stored JSON is identical to the Python version: an array of task dicts where
// starting_date and due_date are ISO strings and duetime is an "HH:MM[:SS]" string.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';

const STORAGE_KEY = 'tasks_list.json';

/**
 * Port of saved_tasks(). Writes the task list to AsyncStorage as JSON.
 * In Python, datetime fields are serialized via default=datetime_convertion
 * (which calls .isoformat()). Here the Task type already stores them as ISO
 * strings, so JSON.stringify does the same thing directly.
 */
export async function saved_tasks(tasks: Task[]): Promise<void> {
  try {
    const json = JSON.stringify(tasks, null, 2);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    // Python branch: except OSError: print("unable to write file ")
    console.error('unable to write file', err);
    throw err;
  }
}

/**
 * Port of load_task(). Reads and parses the JSON, then converts the three
 * datetime-ish fields back — exactly like the Python loop does.
 *
 * In Python, datetime_obj_convert returns datetime objects and time_obj_convert
 * returns a time object. In TypeScript our Task type keeps them as strings
 * (ISO for the datetimes, "HH:MM[:SS]" for the time), so the "conversion" here
 * is normalization: time_obj_convert normalizes "HH:MM" -> "HH:MM:SS" so the
 * combine() helper in datetime.ts can split it reliably.
 */
export async function load_task(): Promise<Task[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json == null || json === '') {
      // Python branch: except FileNotFoundError / empty file -> return []
      return [];
    }
    const parsed = JSON.parse(json) as Task[];
    for (const task of parsed) {
      // Python:
      //   task['due_date'] = datetime_obj_convert(task['due_date'])
      //   task['duetime'] = time_obj_convert(task['duetime'])
      //   task['starting_date'] = datetime_obj_convert(task['starting_date'])
      // Here the datetime fields are already ISO strings (Date-parseable), and
      // we normalize duetime to "HH:MM:SS" for consistent combining later.
      task.due_date = task.due_date; // already ISO string
      task.duetime = normalizeTime(task.duetime);
      task.starting_date = task.starting_date; // already ISO string
    }
    return parsed;
  } catch (err) {
    // Python branches:
    //   except json.decoder.JSONDecodeError: print('file empt'); return []
    //   except ValueError: print("unable to load file"); return []
    console.error('unable to load file', err);
    return [];
  }
}

function normalizeTime(value: string): string {
  const parts = value.split(':');
  if (parts.length === 2) return `${value}:00`;
  return value;
}
