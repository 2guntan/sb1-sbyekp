import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string; 
    phone: string;
    location: { lat: number; lng: number } | null;
    preferredDeliveryTime: string;
  }) => void;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 21; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    slots.push(time);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function CheckoutModal({ isOpen, onClose, onSubmit }: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, location, preferredDeliveryTime });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Checkout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#c52138]">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c52138] focus:ring focus:ring-[#c52138] focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c52138] focus:ring focus:ring-[#c52138] focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#c52138]" />
                Delivery Location
              </div>
            </label>
            <LocationPicker onLocationSelect={setLocation} />
            {location && (
              <p className="mt-2 text-sm text-gray-600">
                Location selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Delivery Time
            </label>
            <select
              value={preferredDeliveryTime}
              onChange={(e) => setPreferredDeliveryTime(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c52138] focus:ring focus:ring-[#c52138] focus:ring-opacity-50"
            >
              <option value="">Select a delivery time</option>
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#c52138] hover:bg-[#841726] text-white py-3 rounded-lg font-medium transition-colors"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}