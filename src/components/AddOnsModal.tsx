import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Minus, Plus, Loader2 } from 'lucide-react';
import type { MenuItem, Extra } from '../types';
import { getExtras } from '../modules/extras/api';

interface AddOnsModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, selectedExtras: Extra[], quantity: number) => void;
}

export function AddOnsModal({ item, isOpen, onClose, onConfirm }: AddOnsModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadExtras = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        // Try to load from cache first
        const cached = localStorage.getItem('extras_cache');
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (mounted) {
            setExtras(parsedCache.data);
            setIsLoading(false);
          }
        }

        // Then fetch fresh data
        const fetchedExtras = await getExtras();
        if (mounted) {
          setExtras(fetchedExtras);
          setError('');
        }
      } catch (error) {
        if (mounted) {
          console.error('Error loading extras:', error);
          setError('Failed to load extras. Please try again.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadExtras();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedExtras([]);
      setQuantity(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExtraToggle = (extra: Extra) => {
    setSelectedExtras((current) => {
      const exists = current.find((a) => a.id === extra.id);
      if (exists) {
        return current.filter((a) => a.id !== extra.id);
      }
      return [...current, extra];
    });
    setError('');
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleConfirm = () => {
    if (selectedExtras.length === 0) {
      setError('Please select at least one extra');
      return;
    }
    onConfirm(item, selectedExtras, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-dibi-fg">Add extras to {item.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-dibi-accent1 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-dibi-fg mb-2">Quantity</h3>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="btn-secondary p-2 rounded-full disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="btn-secondary p-2 rounded-full disabled:opacity-50"
                disabled={quantity >= 10}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-dibi-accent1" size={24} />
            </div>
          ) : extras.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No extras available
            </div>
          ) : (
            <div className="space-y-3">
              {extras.map((extra) => {
                const isSelected = selectedExtras.some(a => a.id === extra.id);
                return (
                  <label key={extra.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleExtraToggle(extra)}
                      className="w-4 h-4 text-dibi-accent1 rounded focus:ring-dibi-accent1"
                    />
                    <span className="flex-1">{extra.name}</span>
                    <span className="font-medium text-dibi-accent1">
                      {extra.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      })}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full btn-primary py-3"
            disabled={isLoading}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}