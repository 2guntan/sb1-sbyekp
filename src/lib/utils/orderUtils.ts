import { format } from 'date-fns';

function generateRandomDigit(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function generateOrderId(): string {
  // First digit must be 1-9
  const firstDigit = generateRandomDigit(1, 9);
  
  // Generate remaining 6 digits (0-9)
  const remainingDigits = Array.from(
    { length: 6 },
    () => generateRandomDigit(0, 9)
  ).join('');
  
  return `${firstDigit}${remainingDigits}`;
}

// Format order ID for display
export function formatOrderId(id: string): string {
  return `#${id}`;
}

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Process Order',
    nextStatus: 'processing',
    buttonClass: 'bg-dibi-accent1 hover:bg-dibi-accent2',
    icon: 'ArrowRight',
  },
  processing: {
    label: 'Complete Order',
    nextStatus: 'completed',
    buttonClass: 'bg-green-600 hover:bg-green-700',
    icon: 'CheckCircle',
  },
  completed: {
    label: '',
    nextStatus: null,
    buttonClass: '',
    icon: null,
  },
  cancelled: {
    label: '',
    nextStatus: null,
    buttonClass: '',
    icon: null,
  },
} as const;