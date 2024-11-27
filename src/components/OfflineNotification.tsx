import React from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineNotification() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3 animate-fade-in">
      <WifiOff className="text-yellow-600" size={20} />
      <div>
        <p className="font-medium text-yellow-800">You're offline</p>
        <p className="text-sm text-yellow-600">Changes will sync when connection is restored</p>
      </div>
    </div>
  );
}