import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc,
  enableIndexedDbPersistence,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import type { Order, OrderStatus, MenuItem, DeliverySettings, Extra } from '../types';
import { generateOrderId } from './utils/orderUtils';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

enableIndexedDbPersistence(db).catch((err) => {
  console.error('Failed to enable persistence:', err);
});

export const storage = getStorage(app);

// Collection names
const MENU_COLLECTION = 'menu';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const EXTRAS_COLLECTION = 'extras';

// Cache keys and durations
const MENU_CACHE_KEY = 'menu_items_cache';
const SETTINGS_CACHE_KEY = 'delivery_settings_cache';
const EXTRAS_CACHE_KEY = 'extras_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default settings
const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  baseDeliveryFee: 1000,
  minimumOrderAmount: 5000,
  maxDeliveryDistance: 10,
  deliveryZone: {
    center: {
      lat: 14.6937,
      lng: -17.4441
    },
    radius: 5
  }
};

// Add this helper function at the top of the file
function convertTimestampToISO(timestamp: unknown): string {
  try {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toISOString();
    }
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
      const { seconds, nanoseconds } = timestamp as { seconds: number; nanoseconds: number };
      return new Timestamp(seconds, nanoseconds).toDate().toISOString();
    }
    return new Date().toISOString();
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return new Date().toISOString();
  }
}

// Menu Items Management
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const menuQuery = query(collection(db, MENU_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(menuQuery);
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));

    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify({
      data: items,
      timestamp: Date.now()
    }));

    return items;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached).data;
    }
    return [];
  }
}

export async function addMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MENU_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    localStorage.removeItem(MENU_CACHE_KEY);
    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw new Error('Failed to add menu item');
  }
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  try {
    const docRef = doc(db, MENU_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    localStorage.removeItem(MENU_CACHE_KEY);
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw new Error('Failed to update menu item');
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MENU_COLLECTION, id));
    localStorage.removeItem(MENU_CACHE_KEY);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw new Error('Failed to delete menu item');
  }
}

// Orders Management
export async function createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    if (!orderData.customer?.name || !orderData.customer?.phone || !orderData.customer?.location) {
      throw new Error('Missing required customer information');
    }

    if (!orderData.items?.length) {
      throw new Error('Order must contain at least one item');
    }

    const formattedItems = orderData.items.map(item => ({
      ...item,
      extras: item.extras?.map(extra => 
        typeof extra === 'string' ? extra : {
          id: extra.id,
          name: extra.name,
          price: extra.price
        }
      ) || []
    }));

    const now = Timestamp.now();
    const orderId = generateOrderId();
    
    const existingOrder = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    if (existingOrder.exists()) {
      throw new Error('Order ID collision detected. Please try again.');
    }
    
    const orderDoc = {
      customer: {
        name: orderData.customer.name,
        phone: orderData.customer.phone,
        location: orderData.customer.location,
      },
      preferredDeliveryTime: orderData.preferredDeliveryTime || null,
      items: formattedItems,
      total: orderData.total,
      status: 'pending' as OrderStatus,
      createdAt: now,
      updatedAt: now,
      id: orderId,
      statusHistory: {
        pending: now
      }
    };

    await setDoc(doc(db, ORDERS_COLLECTION, orderId), orderDoc);
    return orderId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    console.error('Error creating order:', errorMessage);
    throw new Error(errorMessage);
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  if (!orderId || !newStatus) {
    throw new Error('Order ID and new status are required');
  }

  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const orderData = orderSnap.data();
    const currentStatus = orderData?.status as OrderStatus;

    if (!currentStatus) {
      throw new Error('Invalid order data');
    }

    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    // Check if the status transition is valid
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    const now = Timestamp.now();
    const updateData = {
      status: newStatus,
      updatedAt: now,
      [`statusHistory.${newStatus}`]: now
    };

    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error instanceof Error ? error : new Error('Failed to update order status');
  }
}


export function subscribeToOrders(callback: (orders: Order[], error?: Error) => void) {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        try {
          const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            
            return {
              id: doc.id,
              orderNumber: data.orderNumber || doc.id.slice(0, 8).toUpperCase(),
              status: data.status || 'pending',
              createdAt: convertTimestampToISO(data.createdAt),
              updatedAt: convertTimestampToISO(data.updatedAt),
              customer: {
                name: data.customer?.name || 'Unknown',
                phone: data.customer?.phone || '',
                location: data.customer?.location || { lat: 0, lng: 0 },
                address: data.customer?.address || ''
              },
              items: (data.items || []).map((item: any) => ({
                id: item.id || '',
                name: item.name || '',
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                extras: Array.isArray(item.extras) ? item.extras : []
              })),
              total: Number(data.total) || 0,
              statusHistory: Object.entries(data.statusHistory || {}).reduce((acc, [status, timestamp]) => ({
                ...acc,
                [status]: convertTimestampToISO(timestamp)
              }), {})
            } as Order;
          });

          callback(orders);
        } catch (error) {
          console.error('Error processing orders data:', error);
          callback([], new Error('Failed to process orders'));
        }
      },
      error: (error) => {
        console.error('Error in orders subscription:', error);
        callback([], error instanceof Error ? error : new Error('Failed to subscribe to orders'));
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up orders subscription:', error);
    callback([], error instanceof Error ? error : new Error('Failed to subscribe to orders'));
    return () => {};
  }
}

// Delivery Settings Management
export async function getDeliverySettings(): Promise<DeliverySettings> {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const settingsDoc = await getDoc(doc(db, SETTINGS_COLLECTION, 'delivery'));
    
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, SETTINGS_COLLECTION, 'delivery'), {
        ...DEFAULT_DELIVERY_SETTINGS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return DEFAULT_DELIVERY_SETTINGS;
    }

    const settings = settingsDoc.data() as DeliverySettings;
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
      data: settings,
      timestamp: Date.now()
    }));

    return settings;
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    return DEFAULT_DELIVERY_SETTINGS;
  }
}

export async function updateDeliverySettings(settings: DeliverySettings): Promise<void> {
  try {
    await updateDoc(doc(db, SETTINGS_COLLECTION, 'delivery'), {
      ...settings,
      updatedAt: serverTimestamp()
    });
    localStorage.removeItem(SETTINGS_CACHE_KEY);
  } catch (error) {
    console.error('Error updating delivery settings:', error);
    throw new Error('Failed to update delivery settings');
  }
}

// Image Management
export async function uploadMenuImage(file: File): Promise<{ url: string; path: string }> {
  try {
    const storageRef = ref(storage, `menu/${uuidv4()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, path: storageRef.fullPath };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteMenuImage(path: string): Promise<void> {
  try {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

// Extras Management
export async function getExtras(): Promise<Extra[]> {
  try {
    const cached = localStorage.getItem(EXTRAS_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const extrasQuery = query(collection(db, EXTRAS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(extrasQuery);
    const extras = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Extra));

    localStorage.setItem(EXTRAS_CACHE_KEY, JSON.stringify({
      data: extras,
      timestamp: Date.now()
    }));

    return extras;
  } catch (error) {
    console.error('Error fetching extras:', error);
    const cached = localStorage.getItem(EXTRAS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached).data;
    }
    return [];
  }
}

export async function addExtra(data: Omit<Extra, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, EXTRAS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    localStorage.removeItem(EXTRAS_CACHE_KEY);
    return docRef.id;
  } catch (error) {
    console.error('Error adding extra:', error);
    throw new Error('Failed to add extra');
  }
}

export async function updateExtra(id: string, data: Partial<Extra>): Promise<void> {
  try {
    await updateDoc(doc(db, EXTRAS_COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    localStorage.removeItem(EXTRAS_CACHE_KEY);
  } catch (error) {
    console.error('Error updating extra:', error);
    throw new Error('Failed to update extra');
  }
}

export async function deleteExtra(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EXTRAS_COLLECTION, id));
    localStorage.removeItem(EXTRAS_CACHE_KEY);
  } catch (error) {
    console.error('Error deleting extra:', error);
    throw new Error('Failed to delete extra');
  }
}