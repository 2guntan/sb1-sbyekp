import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Extra } from './types';

const EXTRAS_COLLECTION = 'extras';
const CACHE_KEY = 'extras_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getExtras(): Promise<Extra[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const extrasQuery = query(
      collection(db, EXTRAS_COLLECTION), 
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(extrasQuery);
    const extras = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Extra));

    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: extras,
      timestamp: Date.now()
    }));

    return extras;
  } catch (error) {
    console.error('Error getting extras:', error);
    // Try to return cached data if available
    const cached = localStorage.getItem(CACHE_KEY);
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
    
    // Clear cache when adding new extra
    localStorage.removeItem(CACHE_KEY);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding extra:', error);
    throw new Error('Failed to add extra');
  }
}

export async function updateExtra(id: string, data: Partial<Extra>): Promise<void> {
  try {
    const docRef = doc(db, EXTRAS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Clear cache when updating extra
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error updating extra:', error);
    throw new Error('Failed to update extra');
  }
}

export async function deleteExtra(id: string): Promise<void> {
  try {
    const docRef = doc(db, EXTRAS_COLLECTION, id);
    await deleteDoc(docRef);
    
    // Clear cache when deleting extra
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error deleting extra:', error);
    throw new Error('Failed to delete extra');
  }
}