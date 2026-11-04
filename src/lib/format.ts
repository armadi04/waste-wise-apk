import {
  differenceInMinutes,
  format,
  isSameDay,
  isSameYear,
  subDays,
} from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
}

export function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatCoordinate(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return '—';
  return value.toFixed(6);
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/** Backend rejects coordinates with more than 6 decimal places. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Short relative label for list rows: "Just now", "5m ago", "Yesterday". */
export function formatRelativeTime(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return '—';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '—';

  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (isSameDay(date, now)) return `${Math.floor(minutes / 60)}h ago`;
  if (isSameDay(date, subDays(now, 1))) return 'Yesterday';
  return format(date, isSameYear(date, now) ? 'dd MMM' : 'dd MMM yyyy');
}

/** Section title for a calendar day: "Today", "Yesterday" or a full date. */
export function formatDayTitle(value: string | Date, now: Date = new Date()) {
  const date = toDate(value);
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, subDays(now, 1))) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
}
