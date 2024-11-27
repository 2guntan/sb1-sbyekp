import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Save, Loader2 } from 'lucide-react';
import { LocationPicker } from '../LocationPicker';
import { getDeliverySettings, updateDeliverySettings } from '../../lib/firebase';
import type { DeliverySettings } from '../../types';

export function Settings() {
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getDeliverySettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await updateDeliverySettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
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

  if (!settings) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dibi-fg">Settings</h1>
        <p className="mt-2 text-gray-600">Configure your store settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Pricing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-dibi-fg mb-6 flex items-center gap-2">
            <DollarSign size={24} className="text-dibi-accent1" />
            Delivery Pricing
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Delivery Fee (XOF)
              </label>
              <input
                type="number"
                value={settings.baseDeliveryFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    baseDeliveryFee: parseInt(e.target.value),
                  })
                }
                className="input-primary w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount (XOF)
              </label>
              <input
                type="number"
                value={settings.minimumOrderAmount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minimumOrderAmount: parseInt(e.target.value),
                  })
                }
                className="input-primary w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Delivery Distance (km)
              </label>
              <input
                type="number"
                value={settings.maxDeliveryDistance}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxDeliveryDistance: parseInt(e.target.value),
                  })
                }
                className="input-primary w-full"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Delivery Zone */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-dibi-fg mb-6 flex items-center gap-2">
            <MapPin size={24} className="text-dibi-accent1" />
            Delivery Zone
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Radius (km)
              </label>
              <input
                type="number"
                value={settings.deliveryZone.radius}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    deliveryZone: {
                      ...settings.deliveryZone,
                      radius: parseInt(e.target.value),
                    },
                  })
                }
                className="input-primary w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone Center
              </label>
              <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                <LocationPicker
                  onLocationSelect={(location) =>
                    setSettings({
                      ...settings,
                      deliveryZone: {
                        ...settings.deliveryZone,
                        center: location,
                      },
                    })
                  }
                />
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              className="btn-primary flex items-center gap-2 w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Zone Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}