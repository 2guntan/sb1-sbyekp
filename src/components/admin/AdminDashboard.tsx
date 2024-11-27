import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { OrderList } from './OrderList';
import { OrderDetails } from './OrderDetails';
import { subscribeToOrders, updateOrderStatus } from '../../lib/firebase';
import { DayPicker } from 'react-day-picker';
import { format, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';
import type { Order, OrderStatus } from '../../types';
import 'react-day-picker/dist/style.css';

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((updatedOrders, error) => {
      setIsLoading(false);
      if (error) {
        setError('Failed to load orders. Please try refreshing the page.');
        return;
      }
      
      setOrders(prevOrders => {
        const orderMap = new Map([...prevOrders, ...updatedOrders].map(order => [order.id, order]));
        return Array.from(orderMap.values()).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      if (selectedOrder) {
        const updatedSelectedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          setSelectedOrder(updatedSelectedOrder);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedOrder]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      (order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesDate = 
      orderDate >= startOfDay(selectedDate) &&
      orderDate <= endOfDay(selectedDate);
    return matchesStatus && matchesSearch && matchesDate;
  });

  const getDailyStats = () => {
    const dailyOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;

    return { dailyOrders, totalRevenue, completedOrders, pendingOrders };
  };

  const stats = getDailyStats();

  const formatSelectedDate = () => {
    if (isToday(selectedDate)) return 'Today';
    if (isYesterday(selectedDate)) return 'Yesterday';
    return format(selectedDate, 'PPP');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dibi-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-dibi-accent1" size={24} />
          <span className="text-dibi-fg">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dibi-fg">Order Management</h1>
        <p className="mt-2 text-gray-600">Manage and track customer orders</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Date Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-dibi-accent1" />
                  <span className="font-medium">{formatSelectedDate()}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {filteredOrders.length} orders
                </span>
              </button>

              {showCalendar && (
                <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }
                    }}
                    className="border rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Daily Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-600">Daily Orders</span>
                <p className="text-2xl font-bold text-dibi-fg mt-1">
                  {stats.dailyOrders}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-600">Revenue</span>
                <p className="text-2xl font-bold text-dibi-accent1 mt-1">
                  {stats.totalRevenue.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                  })}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold text-dibi-fg mt-1">
                  {stats.completedOrders}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock size={18} />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <p className="text-2xl font-bold text-dibi-fg mt-1">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-primary w-full pl-10"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-dibi-fg">
                  <Filter size={18} />
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="input-primary w-full"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <OrderList
            orders={filteredOrders}
            selectedOrderId={selectedOrder?.id}
            onOrderSelect={setSelectedOrder}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedOrder ? (
            <OrderDetails
              order={selectedOrder}
              onStatusUpdate={handleStatusUpdate}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Filter size={48} className="mb-4" />
                <h3 className="text-xl font-medium text-dibi-fg mb-2">No Order Selected</h3>
                <p className="text-gray-600">Select an order from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}