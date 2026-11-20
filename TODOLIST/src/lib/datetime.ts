// src/lib/datetime.ts
//
// Direct ports of the three Python helpers:
//   def datetime_convertion(value): return value.isoformat()
//   def datetime_obj_convert(value): return datetime.fromisoformat(value)
//   def time_obj_convert(value): return time.fromisoformat(value)
//
// Python's datetime.isoformat() produces e.g. "2026-11-16T14:30:00".
// Python's time.isoformat() produces e.g. "14:30" (or "14:30:00" if seconds).
// JS Date can parse the datetime ISO string directly. For the time-only field
// we keep the "HH:MM" string and combine it with the due_date when needed.

/**
 * Port of datetime_convertion(value) -> value.isoformat()
 * Used when saving: turns a Date into an ISO string.
 */
export function datetime_convertion(value: Date): string {
  return value.toISOString();
}

/**
 * Port of datetime_obj_convert(value) -> datetime.fromisoformat(value)
 * Used when loading: turns an ISO string back into a Date.
 */
export function datetime_obj_convert(value: string): Date {
  return new Date(value);
}

/**
 * Port of time_obj_convert(value) -> time.fromisoformat(value)
 * In Python this returns a time object. Here we just keep the "HH:MM[:SS]" string
 * and provide combine() below to mirror datetime.combine(date, time).
 */
export function time_obj_convert(value: string): string {
  // Python's time.fromisoformat accepts "HH:MM" or "HH:MM:SS".
  // We normalize to "HH:MM:SS" so combining is predictable.
  const parts = value.split(':');
  if (parts.length === 2) return `${value}:00`;
  return value;
}

/**
 * Port of: datetime.combine(task['due_date'].date(), task['duetime'])
 * from the overdue() function.
 *
 * due_date_iso is an ISO string like "2026-11-16T00:00:00.000Z" (we store the
 * date at midnight). duetime_str is "HH:MM" or "HH:MM:SS".
 * Returns a Date representing the full deadline moment.
 */
export function combine(due_date_iso: string, duetime_str: string): Date {
  const date = new Date(due_date_iso);
  const [h, m, s] = time_obj_convert(duetime_str).split(':').map(Number);
  date.setHours(h, m, s || 0, 0);
  return date;
}

/**
 * Parse a user-typed date "dd/mm/yyyy" the same way the Python code does:
 *   datetime.strptime(user_input, "%d/%m/%Y")
 * Returns a Date at local midnight.
 */
export function parseDueDate(input: string): Date {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) throw new Error('invalid date');
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1; // JS months are 0-indexed
  const year = parseInt(m[3], 10);
  const d = new Date(year, month, day, 0, 0, 0, 0);
  if (isNaN(d.getTime())) throw new Error('invalid date');
  return d;
}

/**
 * Parse a user-typed time "HH:MM" (24-hour) the same way the Python code does:
 *   datetime.strptime(user_inputs, "%H:%M").time()
 * Returns the "HH:MM" string (what Python's .time().isoformat() produces).
 */
export function parseDueTime(input: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!m) throw new Error('invalid time');
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) throw new Error('invalid time');
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** Format a Date as "dd/mm/yyyy" for display in the UI. */
export function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Format a Date for display as a full datetime string, like Python's default str(). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}
