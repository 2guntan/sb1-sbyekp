import React from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Extra } from '../types';

interface ExtraFormProps {
  initialData?: Extra;
  onSubmit: (data: Omit<Extra, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export function ExtraForm({ initialData, onSubmit, onClose, isOpen }: ExtraFormProps) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    price: initialData?.price || 0,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save extra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {initialData ? 'Edit Extra' : 'Add New Extra'}
          </h2>
          <button
            onClick={onClose}
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

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Extra'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}