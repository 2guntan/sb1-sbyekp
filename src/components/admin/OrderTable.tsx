import React from 'react';
import { formatOrderDate } from '../../lib/utils/dateFormatters';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderActionButton } from './OrderActionButton';
import { Eye } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';

interface OrderTableProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderTable({ orders, onStatusUpdate }: OrderTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Order ID</th>
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Customer</th>
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Items</th>
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Total</th>
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Status</th>
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Date</th>
              <th className="py-3 px-4 font-medium text-gray-600 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium">#{order.id}</span>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-sm text-gray-500">{order.customer.phone}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="max-w-xs">
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${item.id}-${index}`} className="text-sm">
                        {item.quantity}× {item.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-dibi-accent1">
                    {order.total.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                    })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{formatOrderDate(order.createdAt)}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <OrderActionButton order={order} onStatusUpdate={onStatusUpdate} />
                    <button
                      className="p-2 text-gray-400 hover:text-dibi-accent1 transition-colors"
                      onClick={() => {/* TODO: Implement view details */}}
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}