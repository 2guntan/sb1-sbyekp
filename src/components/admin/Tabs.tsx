import React from 'react';

interface TabsProps {
  children: React.ReactNode;
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function Tabs({ children, selectedIndex, onChange }: TabsProps) {
  return <div>{children}</div>;
}

interface TabListProps {
  children: React.ReactNode;
}

export function TabList({ children }: TabListProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { index });
          }
          return child;
        })}
      </nav>
    </div>
  );
}

interface TabProps {
  children: React.ReactNode;
  index?: number;
}

export function Tab({ children, index }: TabProps) {
  const isSelected = index === 0; // Replace with actual logic
  return (
    <button
      className={`
        py-2 px-1 border-b-2 font-medium text-sm
        ${isSelected
          ? 'border-dibi-accent1 text-dibi-accent1'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <div>{children}</div>;
}