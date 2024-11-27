import { useState, useEffect, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { subscribeToOrders, updateOrderStatus } from '../../lib/firebase';
import { OrderTable } from './OrderTable';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorAlert } from '../ErrorAlert';
import type { Order, OrderStatus } from '../../types';

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updateError, setUpdateError] = useState<string | null>(null);

  const parseDate = (dateStr: string): Date => {
    try {
      return new Date(dateStr);
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  };

  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribeToOrders((updatedOrders, error) => {
      if (!mounted) return;

      setIsLoading(false);
      if (error) {
        setError('Failed to load orders. Please try refreshing the page.');
        return;
      }

      const sortedOrders = [...updatedOrders].sort((a, b) => {
        try {
          return parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime();
        } catch (error) {
          console.error('Error sorting orders:', error);
          return 0;
        }
      });

      setOrders(sortedOrders);
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

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      try {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = !searchQuery || 
          order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items?.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
      } catch (error) {
        console.error('Error filtering order:', error);
        return false;
      }
    });
  }, [orders, statusFilter, searchQuery]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dibi-fg">Order Management</h1>
        <p className="mt-2 text-gray-600">Track and manage customer orders</p>
      </div>

      {error && <ErrorAlert message={error} />}
      {updateError && <ErrorAlert message={updateError} />}

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dibi-accent1 focus:border-dibi-accent1 outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="flex gap-4">
          <div className="relative min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-dibi-accent1 focus:border-dibi-accent1 outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <OrderTable 
        orders={filteredOrders}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}