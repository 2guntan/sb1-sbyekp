import React from 'react';
import { Clock, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { Order } from '../../types';

interface OrderListProps {
  orders: Order[];
  selectedOrderId?: string;
  onOrderSelect: (order: Order) => void;
}

const STATUS_ICONS = {
  pending: <Clock className="text-yellow-600" size={18} />,
  processing: <Loader2 className="text-blue-600 animate-spin" size={18} />,
  completed: <CheckCircle2 className="text-green-600" size={18} />,
  cancelled: <XCircle className="text-red-600" size={18} />,
};

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export function OrderList({ orders, selectedOrderId, onOrderSelect }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 text-center">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
      <div className="divide-y">
        {orders.map((order) => {
          // Create a unique key using order ID and timestamp
          const uniqueKey = `${order.id}-${order.createdAt}`;
          
          return (
            <button
              key={uniqueKey}
              onClick={() => onOrderSelect(order)}
              className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${
                selectedOrderId === order.id ? 'bg-gray-50 border-l-4 border-dibi-accent1' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-medium text-dibi-fg">#{order.id}</span>
                  <p className="text-sm text-gray-600 mt-1">{order.customer.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[order.status]}`}>
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICONS[order.status]}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </span>
                <span className="font-medium text-dibi-accent1">
                  {order.total.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                  })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}