import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { getAddOns, addAddOn, updateAddOn, deleteAddOn } from '../../lib/firebase';
import type { AddOn } from '../../types';

export function AddOnsManagement() {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    active: true,
  });

  useEffect(() => {
    loadAddOns();
  }, []);

  const loadAddOns = async () => {
    try {
      const fetchedAddOns = await getAddOns();
      setAddOns(fetchedAddOns);
    } catch (error) {
      setError('Failed to load add-ons');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      active: true,
    });
    setEditingAddOn(null);
    setIsModalOpen(false);
    setError(null);
  };

  const handleEdit = (addOn: AddOn) => {
    setEditingAddOn(addOn);
    setFormData({
      name: addOn.name,
      price: addOn.price,
      active: addOn.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this add-on?')) return;

    try {
      await deleteAddOn(id);
      setAddOns(prev => prev.filter(addOn => addOn.id !== id));
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = 'Add-on deleted successfully!';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (error) {
      setError('Failed to delete add-on');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingAddOn) {
        await updateAddOn(editingAddOn.id, formData);
      } else {
        await addAddOn(formData);
      }

      await loadAddOns();
      resetForm();

      const message = editingAddOn ? 'Add-on updated successfully!' : 'New add-on added successfully!';
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (error) {
      setError('Failed to save add-on');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-dibi-accent1" size={24} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dibi-fg">Add-ons Management</h2>
          <p className="mt-2 text-gray-600">Manage additional items that customers can add to their orders</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Add-on
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left font-medium text-gray-600">Name</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Price</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Status</th>
              <th className="py-3 px-4 text-right font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {addOns.map((addOn) => (
              <tr key={addOn.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900">{addOn.name}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-dibi-accent1 font-medium">
                    {addOn.price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                    })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    addOn.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {addOn.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(addOn)}
                      className="p-2 text-gray-400 hover:text-dibi-accent1 transition-colors"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(addOn.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {addOns.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No add-ons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingAddOn ? 'Edit Add-on' : 'Add New Add-on'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-dibi-accent1"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-primary w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (XOF)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="input-primary w-full"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-dibi-accent1 focus:ring-dibi-accent1 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full py-2 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {editingAddOn ? 'Update Add-on' : 'Add Add-on'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}