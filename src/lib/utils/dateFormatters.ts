import { format } from 'date-fns';

export function formatOrderDate(date: Date | string): string {
  const orderDate = new Date(date);
  return format(orderDate, 'MMM d, h:mm a');
}

export function formatShortTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a');
}

export function formatFullDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}