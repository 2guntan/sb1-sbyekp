import React from 'react';

export function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-16 relative">
              <img 
                src="/logo.png"
                alt="Dibi.B Logo" 
                className="h-full w-auto object-contain"
                style={{ filter: 'brightness(0) saturate(100%) invert(19%) sepia(92%) saturate(3086%) hue-rotate(334deg) brightness(85%) contrast(97%)' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}