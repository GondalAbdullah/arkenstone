/**
 * Formats a Date the same way SQLite's `datetime('now', 'localtime')` does:
 * 'YYYY-MM-DD HH:MM:SS' in the device's local time, with no timezone suffix.
 *
 * Rows inserted with a user-picked date must use this (not `Date#toISOString`,
 * which is UTC) so that every row in `transactions.timestamp` is comparable —
 * otherwise day/month grouping (the weekly chart, monthly totals) can put a
 * manually-dated entry in the wrong bucket for anyone outside UTC.
 */
export function toSqliteLocalDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}
