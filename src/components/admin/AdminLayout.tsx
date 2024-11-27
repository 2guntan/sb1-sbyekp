import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  ClipboardList,
  ShoppingBag, 
  Settings, 
  LogOut,
  Menu as MenuIcon,
  X,
  LayoutDashboard
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/logo.png';

const menuItems = [
  {
    title: 'Daily Tracking',
    icon: LayoutDashboard,
    path: '/admin/orders',
  },
  {
    title: 'All Orders',
    icon: ClipboardList,
    path: '/admin/all-orders',
  },
  {
    title: 'Store Management',
    icon: ShoppingBag,
    path: '/admin/store',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/admin/settings',
  },
];

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dibi-bg">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        <MenuIcon size={24} />
      </button>

      <div className="flex h-screen">
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:transform-none
          `}
        >
          <div className="h-full flex flex-col">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
            >
              <X size={24} />
            </button>

            <div className="p-6">
              <img
                src={logoUrl}
                alt="Dibi.B Logo"
                className="h-12 w-auto"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(19%) sepia(92%) saturate(3086%) hue-rotate(334deg) brightness(85%) contrast(97%)',
                }}
              />
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? 'bg-dibi-accent1 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
}