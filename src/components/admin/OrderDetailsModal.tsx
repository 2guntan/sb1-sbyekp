import React from 'react';
import { format } from 'date-fns';
import {
  X,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
}

const STATUS_ACTIONS: { [K in OrderStatus]: OrderStatus[] } = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const STATUS_BUTTONS = {
  processing: {
    icon: <Loader2 size={16} className="animate-spin" />,
    text: 'Mark as Processing',
    class: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  },
  completed: {
    icon: <CheckCircle2 size={16} />,
    text: 'Mark as Completed',
    class: 'bg-green-50 text-green-600 hover:bg-green-100',
  },
  cancelled: {
    icon: <XCircle size={16} />,
    text: 'Cancel Order',
    class: 'bg-red-50 text-red-600 hover:bg-red-100',
  },
};

export function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-3xl my-8">
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white border-b z-10 rounded-t-lg">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-bold text-dibi-fg">
                Order #{order.id}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {format(new Date(order.createdAt), 'PPpp')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-dibi-accent1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Status Actions - Sticky under header */}
          <div className="px-6 pb-4 flex gap-2">
            {STATUS_ACTIONS[order.status].map((status) => {
              const button = STATUS_BUTTONS[status];
              return (
                <button
                  key={status}
                  onClick={() => onStatusUpdate(order.id, status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${button.class}`}
                >
                  {button.icon}
                  {button.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-dibi-fg mb-3 flex items-center gap-2">
                  <Phone size={18} className="text-dibi-accent1" />
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">
                    {order.customer.name}
                  </p>
                  <p className="text-gray-600">{order.customer.phone}</p>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-dibi-fg mb-2">Preferred Delivery Time</h3>
                  <p className="text-gray-600">
                    {order.preferredDeliveryTime || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-dibi-fg mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-dibi-accent1" />
                  Delivery Location
                </h3>
                <p className="text-gray-600">
                  {order.customer.location.lat}, {order.customer.location.lng}
                </p>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-dibi-fg mb-4">Order Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      order.status === 'pending'
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Clock
                      className={
                        order.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      }
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-dibi-fg">Order Received</p>
                    <p className="text-sm text-gray-600">
                      Waiting for confirmation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      order.status === 'processing'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Loader2
                      className={`${
                        order.status === 'processing'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      } ${order.status === 'processing' ? 'animate-spin' : ''}`}
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-dibi-fg">Processing</p>
                    <p className="text-sm text-gray-600">
                      Order is being prepared
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <CheckCircle2
                      className={
                        order.status === 'completed'
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-dibi-fg">Completed</p>
                    <p className="text-sm text-gray-600">
                      Order has been delivered
                    </p>
                  </div>
                </div>

                {order.status === 'cancelled' && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <XCircle className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-dibi-fg">Cancelled</p>
                      <p className="text-sm text-gray-600">
                        Order has been cancelled
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-medium text-dibi-fg mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex justify-between items-start bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-dibi-fg">{item.name}</p>
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {item.addOns.map((addon, index) => (
                          <div
                            key={`${item.id}-${addon}-${index}`}
                            className="flex items-center gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            <span>{addon}</span>
                            {index === 0 && (
                              <span className="text-green-600 text-xs">
                                (Free)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-dibi-accent1">
                      {(item.price * item.quantity).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      {(order.total - 1000).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Fee</span>
                    <span>
                      {(1000).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-dibi-fg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-dibi-accent1">
                      {order.total.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}