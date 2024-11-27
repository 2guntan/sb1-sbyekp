import React from 'react';
import { Plus } from 'lucide-react';
import type { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
        }}
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-dibi-fg">{item.name}</h3>
        <p className="text-gray-600 mt-1">{item.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-semibold text-dibi-accent1">
            {item.price.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            })}
          </span>
          <button
            onClick={() => onAdd(item)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}