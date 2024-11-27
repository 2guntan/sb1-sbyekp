import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Extra } from '../types';

interface ExtrasListProps {
  extras: Extra[];
  onEdit: (extra: Extra) => void;
  onDelete: (id: string) => void;
}

export function ExtrasList({ extras, onEdit, onDelete }: ExtrasListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-3 px-4 text-left font-medium text-gray-600">Name</th>
            <th className="py-3 px-4 text-left font-medium text-gray-600">Price</th>
            <th className="py-3 px-4 text-right font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {extras.map((extra) => (
            <tr key={extra.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="font-medium text-gray-900">{extra.name}</span>
              </td>
              <td className="py-3 px-4">
                <span className="font-medium text-dibi-accent1">
                  {extra.price.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                  })}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(extra)}
                    className="p-2 text-gray-400 hover:text-dibi-accent1 transition-colors"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => onDelete(extra.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {extras.length === 0 && (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-500">
                No extras found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}