import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { OrderStatus } from '../../types';
import { getErrorMessage } from '../utils/errorHandling';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const ORDERS_COLLECTION = 'orders';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function updateOrderStatusWithTransaction(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  if (!orderId || !newStatus) {
    throw new Error('Order ID and new status are required');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await executeStatusUpdate(orderId, newStatus);
      return;
    } catch (error) {
      lastError = new Error(getErrorMessage(error));
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * attempt);
        continue;
      }
    }
  }
  
  throw lastError || new Error(`Failed to update status for order ${orderId} after ${MAX_RETRIES} attempts`);
}

async function executeStatusUpdate(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const timestamp = Timestamp.now();

  await runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);

    if (!orderDoc.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }

    const orderData = orderDoc.data() || {};
    const currentStatus = orderData?.status as OrderStatus;

    if (!currentStatus) {
      throw new Error(`Invalid order data for order ${orderId}: missing status`);
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Cannot transition order ${orderId} from ${currentStatus} to ${newStatus}`);
    }
    
    transaction.update(orderRef, {
      status: newStatus,
      updatedAt: timestamp,
      [`statusHistory.${newStatus}`]: timestamp
    });
  });
}
  });