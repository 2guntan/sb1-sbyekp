import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { ExtrasList } from './ExtrasList';
import { ExtraForm } from './ExtraForm';
import { getExtras, addExtra, updateExtra, deleteExtra } from '../api';
import type { Extra } from '../types';

export function ExtrasManagement() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);

  useEffect(() => {
    loadExtras();
  }, []);

  const loadExtras = async () => {
    try {
      const fetchedExtras = await getExtras();
      setExtras(fetchedExtras);
    } catch (error) {
      console.error('Failed to load extras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (data: Omit<Extra, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addExtra(data);
    await loadExtras();
    showSuccessToast('Extra added successfully!');
  };

  const handleEdit = async (data: Omit<Extra, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingExtra) return;
    await updateExtra(editingExtra.id, data);
    await loadExtras();
    showSuccessToast('Extra updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this extra?')) return;
    
    try {
      await deleteExtra(id);
      await loadExtras();
      showSuccessToast('Extra deleted successfully!');
    } catch (error) {
      console.error('Failed to delete extra:', error);
    }
  };

  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-dibi-accent1" size={24} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dibi-fg">Extras Management</h2>
          <p className="mt-2 text-gray-600">Manage additional items that customers can add to their orders</p>
        </div>
        <button
          onClick={() => {
            setEditingExtra(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Extra
        </button>
      </div>

      <ExtrasList
        extras={extras}
        onEdit={(extra) => {
          setEditingExtra(extra);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <ExtraForm
        initialData={editingExtra}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExtra(null);
        }}
        onSubmit={editingExtra ? handleEdit : handleAdd}
      />
    </div>
  );
}