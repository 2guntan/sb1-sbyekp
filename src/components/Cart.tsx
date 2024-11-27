import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck } from 'lucide-react';
import type { CartItem } from '../types';
import { getDeliverySettings } from '../lib/firebase';

interface CartProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function Cart({ items, onRemove, onCheckout }: CartProps) {
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [minimumOrder, setMinimumOrder] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getDeliverySettings();
        setDeliveryFee(settings.baseDeliveryFee);
        setMinimumOrder(settings.minimumOrderAmount);
      } catch (error) {
        console.error('Error loading delivery settings:', error);
        // Fallback to default values if settings can't be loaded
        setDeliveryFee(1000);
        setMinimumOrder(5000);
      }
    };

    loadSettings();
  }, []);

  const calculateItemTotal = (item: CartItem) => {
    const extraTotal = item.extras?.reduce((sum, extra) => sum + (typeof extra === 'string' ? 0 : extra.price), 0) || 0;
    return (item.price + extraTotal) * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const total = subtotal + (items.length > 0 ? deliveryFee : 0);
  const canCheckout = subtotal >= minimumOrder;

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <ShoppingBag className="mx-auto text-dibi-accent2 mb-3" size={32} />
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-dibi-fg">Your Order</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.extras?.join('-')}`} className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-dibi-fg">{item.name}</h3>
              {item.extras && item.extras.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  {item.extras.map((extra, index) => (
                    <div key={`${item.id}-${extra}-${index}`} className="flex items-center gap-1">
                      <span>{typeof extra === 'string' ? extra : extra.name}</span>
                      {typeof extra !== 'string' && (
                        <span className="text-dibi-accent1 text-xs">
                          (+{extra.price.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                          })})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-dibi-accent1 font-medium">
                {calculateItemTotal(item).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                })}
              </span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-gray-400 hover:text-dibi-accent1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t mt-6 pt-4 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>
            {subtotal.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            })}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-2">
            <Truck size={18} />
            Delivery
          </span>
          <span>
            {deliveryFee.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            })}
          </span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-3 border-t">
          <span>Total</span>
          <span className="text-dibi-accent1">
            {total.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            })}
          </span>
        </div>

        {!canCheckout && (
          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
            Minimum order amount is {minimumOrder.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'XOF',
            })}
          </div>
        )}

        <button
          onClick={onCheckout}
          disabled={!canCheckout}
          className="w-full btn-primary py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canCheckout ? 'Proceed to Checkout' : 'Add more items'}
        </button>
      </div>
    </div>
  );
}