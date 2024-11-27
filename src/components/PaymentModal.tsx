import React, { useState } from 'react';
import { X, Wallet, Phone, DollarSign, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  isProcessing?: boolean;
}

type PaymentMethod = 'wave' | 'orange' | 'cash';

interface PaymentDetails {
  wave: { phone: string };
  orange: { phone: string };
  cash: { note: string };
}

export function PaymentModal({ isOpen, onClose, onConfirm, total, isProcessing = false }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    wave: { phone: '' },
    orange: { phone: '' },
    cash: { note: '' },
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedMethod !== 'cash' && !paymentDetails[selectedMethod].phone) {
      setError('Please enter a valid phone number');
      return;
    }

    onConfirm();
  };

  const updatePaymentDetails = (
    method: PaymentMethod,
    field: string,
    value: string
  ) => {
    setPaymentDetails(prev => ({
      ...prev,
      [method]: { ...prev[method], [field]: value },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-dibi-accent1"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handlePaymentSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === 'wave'}
                onChange={() => setSelectedMethod('wave')}
                className="text-dibi-accent1 focus:ring-dibi-accent1"
              />
              <Wallet className="text-blue-500" size={24} />
              <div className="flex-1">
                <p className="font-medium">Wave</p>
                <p className="text-sm text-gray-600">Pay with Wave Mobile Money</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === 'orange'}
                onChange={() => setSelectedMethod('orange')}
                className="text-dibi-accent1 focus:ring-dibi-accent1"
              />
              <Phone className="text-orange-500" size={24} />
              <div className="flex-1">
                <p className="font-medium">Orange Money</p>
                <p className="text-sm text-gray-600">Pay with Orange Money</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === 'cash'}
                onChange={() => setSelectedMethod('cash')}
                className="text-dibi-accent1 focus:ring-dibi-accent1"
              />
              <DollarSign className="text-green-500" size={24} />
              <div className="flex-1">
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-gray-600">Pay when your order arrives</p>
              </div>
            </label>
          </div>

          {(selectedMethod === 'wave' || selectedMethod === 'orange') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={paymentDetails[selectedMethod].phone}
                onChange={(e) =>
                  updatePaymentDetails(selectedMethod, 'phone', e.target.value)
                }
                placeholder="Enter your phone number"
                className="input-primary w-full"
                required
              />
            </div>
          )}

          {selectedMethod === 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note for Delivery
              </label>
              <textarea
                value={paymentDetails.cash.note}
                onChange={(e) =>
                  updatePaymentDetails('cash', 'note', e.target.value)
                }
                placeholder="Any special instructions for delivery?"
                className="input-primary w-full"
                rows={3}
              />
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold text-dibi-accent1">
                {total.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                })}
              </span>
            </div>

            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Finalize Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}