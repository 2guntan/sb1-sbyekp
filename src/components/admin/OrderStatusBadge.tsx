import React from 'react';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { OrderStatus } from '../../types';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    text: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  processing: {
    icon: Loader2,
    text: 'Processing',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  completed: {
    icon: CheckCircle2,
    text: 'Completed',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  cancelled: {
    icon: XCircle,
    text: 'Cancelled',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
      <Icon size={14} className={status === 'processing' ? 'animate-spin' : ''} />
      {config.text}
    </span>
  );
}