import React, { useState, useEffect } from 'react';
import { MenuCard } from '../components/MenuCard';
import { Cart } from '../components/Cart';
import { CheckoutModal } from '../components/CheckoutModal';
import { PaymentModal } from '../components/PaymentModal';
import { AddOnsModal } from '../components/AddOnsModal';
import { Header } from '../components/Header';
import { getMenuItems, createOrder } from '../lib/firebase';
import type { CartItem, MenuItem, Extra } from '../types';

export function CustomerView() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [addOnsModalItem, setAddOnsModalItem] = useState<MenuItem | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    name: string;
    phone: string;
    location: { lat: number; lng: number } | null;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Error loading menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const addToCart = (item: MenuItem) => {
    setAddOnsModalItem(item);
  };

  const handleAddOnsConfirm = (item: MenuItem, selectedExtras: Extra[], quantity: number) => {
    setCart((current) => [
      ...current,
      {
        ...item,
        quantity,
        extras: selectedExtras,
      },
    ]);
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const handleCheckout = (data: {
    name: string;
    phone: string;
    preferredDeliveryTime: string;
    location: { lat: number; lng: number } | null;
  }) => {
    if (!data.location) {
      alert('Please select a delivery location');
      return;
    }
    setCheckoutData(data);
    setIsCheckoutOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!checkoutData) return;
    
    if (!checkoutData.location) {
      alert('Please select a delivery location');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: cart,
        customer: {
          name: checkoutData.name,
          phone: checkoutData.phone,
          location: checkoutData.location,
        },
        preferredDeliveryTime: checkoutData.preferredDeliveryTime,
        total: calculateTotal(),
      };
      
      await createOrder(orderData);
      setCart([]);
      setCheckoutData(null);
      setIsPaymentOpen(false);
      alert('Order placed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      console.error('Failed to create order:', errorMessage);
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const extraTotal = item.extras?.reduce((sum, extra, index) => {
        if (index === 0) return sum;
        return sum + (typeof extra === 'string' ? 0 : extra.price);
      }, 0) || 0;
      return sum + (item.price + extraTotal) * item.quantity;
    }, 0);
    return subtotal + (cart.length > 0 ? 1000 : 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dibi-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dibi-accent1 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dibi-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-dibi-fg">Our Menu</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {menuItems.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Cart
              items={cart}
              onRemove={removeFromCart}
              onCheckout={() => setIsCheckoutOpen(true)}
            />
          </div>
        </div>
      </main>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckout}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={handlePaymentConfirm}
        total={calculateTotal()}
        isProcessing={isProcessing}
      />

      <AddOnsModal
        item={addOnsModalItem!}
        isOpen={!!addOnsModalItem}
        onClose={() => setAddOnsModalItem(null)}
        onConfirm={handleAddOnsConfirm}
      />
    </div>
  );
}