import React from 'react';
import { ArrowRight, Ban } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_CONFIG } from '../../lib/utils/orderUtils';

interface OrderActionButtonProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderActionButton({ order, onStatusUpdate }: OrderActionButtonProps) {
  const config = ORDER_STATUS_CONFIG[order.status];

  if (!config.nextStatus) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onStatusUpdate(order.id, config.nextStatus as OrderStatus)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-sm font-medium transition-colors ${config.buttonClass}`}
      >
        {config.label}
        <ArrowRight size={14} />
      </button>
      
      {order.status === 'pending' && (
        <button
          onClick={() => onStatusUpdate(order.id, 'cancelled')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors"
        >
          <Ban size={14} />
          Cancel Order
        </button>
      )}
    </div>
  );
}