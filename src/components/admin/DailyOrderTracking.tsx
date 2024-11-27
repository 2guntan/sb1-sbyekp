import { useState, useEffect, useMemo } from 'react';
import { Search, Package, Clock, ArrowRight } from 'lucide-react';
import { formatFullDate, formatShortTime } from '../../lib/utils/dateFormatters';
import { subscribeToOrders, updateOrderStatus } from '../../lib/firebase';
import { formatOrderId } from '../../lib/utils/orderUtils';
import { OrderActionButton } from './OrderActionButton';
import type { Order, OrderStatus } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorAlert } from '../ErrorAlert';
import { OrderStatusBadge } from './OrderStatusBadge';

export function DailyOrderTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return orders
      .filter(order => {
        try {
          const orderDate = new Date(order.createdAt);
          const matchesDate = orderDate >= startOfDay && orderDate < endOfDay;
          
          const matchesSearch = !searchQuery || 
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items?.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
          
          return matchesDate && matchesSearch;
        } catch (error) {
          console.error('Error filtering order:', error);
          return false;
        }
      })
      .sort((a, b) => {
        try {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } catch (error) {
          console.error('Error sorting orders:', error);
          return 0;
        }
      });
  }, [orders, searchQuery]);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeToOrders((updatedOrders, error) => {
      if (!mounted) return;

      setIsLoading(false);
      if (error) {
        setError('Failed to load orders. Please try refreshing the page.');
        return;
      }

      setOrders(updatedOrders);
      setError(null);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (!orderId || !newStatus) {
      setUpdateError('Invalid order ID or status');
      setTimeout(() => setUpdateError(null), 5000);
      return;
    }

    try {
      setUpdateError(null);
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      setUpdateError(errorMessage);
      setTimeout(() => setUpdateError(null), 5000);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dibi-fg">Today's Orders</h1>
        <p className="mt-2 text-gray-600">{formatFullDate(new Date())}</p>
      </div>

      {error && <ErrorAlert message={error} />}
      {updateError && <ErrorAlert message={updateError} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-dibi-accent1" size={24} />
            <h3 className="text-lg font-medium">Total Orders Today</h3>
          </div>
          <p className="text-3xl font-bold">{filteredOrders.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-dibi-accent1" size={24} />
            <h3 className="text-lg font-medium">Pending Orders</h3>
          </div>
          <p className="text-3xl font-bold">
            {filteredOrders.filter(order => order.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dibi-accent1 focus:border-dibi-accent1 outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Order ID</th>
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Time</th>
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Customer</th>
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Items</th>
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Total</th>
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Status</th>
                <th className="py-3 px-4 font-medium text-gray-600 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatOrderId(order.id)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-500">
                      {formatShortTime(order.createdAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      {order.preferredDeliveryTime && (
                        <div className="text-sm text-gray-500">
                          Preferred Time: {order.preferredDeliveryTime}
                        </div>
                      )}
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
                    <OrderActionButton
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No orders found today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}