import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerView } from './views/CustomerView';
import { AdminLayout } from './components/admin/AdminLayout';
import { DailyOrderTracking } from './components/admin/DailyOrderTracking';
import { OrderManagement } from './components/admin/OrderManagement';
import { StoreManagement } from './components/admin/StoreManagement';
import { Settings } from './components/admin/Settings';
import { LoginPage } from './components/admin/LoginPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { OfflineNotification } from './components/OfflineNotification';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<CustomerView />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/orders" replace />} />
            <Route path="orders" element={<DailyOrderTracking />} />
            <Route path="all-orders" element={<OrderManagement />} />
            <Route path="store" element={<StoreManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <OfflineNotification />
      </AuthProvider>
    </Router>
  );
}