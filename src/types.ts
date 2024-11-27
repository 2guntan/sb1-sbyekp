export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imagePath?: string;
  category: 'meat' | 'chicken';
  extras?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface CartItem extends MenuItem {
  quantity: number;
  extras?: (string | Extra)[];
}

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  items: CartItem[];
  status: OrderStatus;
  total: number;
  preferredDeliveryTime?: string;
  createdAt: string;
  updatedAt?: string;
  firebaseId?: string;
}

export interface DeliverySettings {
  baseDeliveryFee: number;
  minimumOrderAmount: number;
  maxDeliveryDistance: number;
  deliveryZone: {
    center: {
      lat: number;
      lng: number;
    };
    radius: number;
  };
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}