import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-dibi-bg flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin text-dibi-accent1" size={24} />
        <span className="text-dibi-fg">Loading...</span>
      </div>
    </div>
  );
}