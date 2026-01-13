import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  where,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Add expense to Firestore
export const addExpense = async (date, category, amount, comment) => {
  try {
    // Convert date to Firestore Timestamp if it's a Date object
    let dateToStore = date;
    if (date instanceof Date) {
      dateToStore = Timestamp.fromDate(date);
    } else if (typeof date === 'string') {
      // Handle string dates by parsing them
      const parsedDate = new Date(date);
      dateToStore = Timestamp.fromDate(parsedDate);
    }
    
    const expenseData = {
      date: dateToStore,
      category: category,
      amount: parseFloat(amount),
      comment: comment || 'N/A',
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense: ', error);
    throw error;
  }
};

// Get all expenses from Firestore (for backward compatibility)
export const getExpenses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort by date descending on client side (most recent first)
    expenses.sort((a, b) => {
      const dateA = a.date && a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date && b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA; // Descending order (newest first)
    });
    
    return expenses;
  } catch (error) {
    console.error('Error getting expenses: ', error);
    throw error;
  }
};

// Get expenses by date range with server-side filtering
export const getExpensesByDateRange = async (startDate, endDate) => {
  try {
    // Convert dates to Firestore Timestamps if they're Date objects
    const startTimestamp = startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const endTimestamp = endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;
    
    const q = query(
      collection(db, 'expenses'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort by date descending on client side
    expenses.sort((a, b) => {
      const dateA = a.date && a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date && b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    });
    
    return expenses;
  } catch (error) {
    console.error('Error getting expenses by date range: ', error);
    throw error;
  }
};

// Get expenses by category with server-side filtering
export const getExpensesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort by date descending on client side
    expenses.sort((a, b) => {
      const dateA = a.date && a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date && b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    });
    
    return expenses;
  } catch (error) {
    console.error('Error getting expenses by category: ', error);
    throw error;
  }
};

// Get expenses by date range AND category (combined filtering)
export const getExpensesByDateRangeAndCategory = async (startDate, endDate, category) => {
  try {
    // Convert dates to Firestore Timestamps if they're Date objects
    const startTimestamp = startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const endTimestamp = endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;
    
    const q = query(
      collection(db, 'expenses'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort by date descending on client side
    expenses.sort((a, b) => {
      const dateA = a.date && a.date.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date && b.date.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    });
    
    return expenses;
  } catch (error) {
    console.error('Error getting expenses by date range and category: ', error);
    throw error;
  }
};

// Get expenses for specific time periods (DAILY, WEEKLY, MONTHLY, YEAR)
export const getExpensesByTimeFilter = async (timeFilter) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate, endDate;
    
    switch (timeFilter) {
      case 'DAILY':
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'WEEKLY':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'LAST_WEEK':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'MONTHLY':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        endDate = new Date(now.getFullYear(), now.getMonth(), lastDayOfMonth);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'LAST_MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        endDate = new Date(now.getFullYear(), now.getMonth() - 1, lastDayOfLastMonth);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'LAST_3_MONTHS':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'LAST_6_MONTHS':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      case 'YEAR':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
        
      default:
        throw new Error(`Invalid time filter: ${timeFilter}`);
    }
    
    return await getExpensesByDateRange(startDate, endDate);
  } catch (error) {
    console.error('Error getting expenses by time filter: ', error);
    throw error;
  }
};

// Update expense in Firestore
export const updateExpense = async (docId, date, category, amount, comment) => {
  try {
    // Convert date to Firestore Timestamp if it's a Date object
    let dateToStore = date;
    if (date instanceof Date) {
      dateToStore = Timestamp.fromDate(date);
    } else if (typeof date === 'string') {
      // Handle string dates by parsing them
      const parsedDate = new Date(date);
      dateToStore = Timestamp.fromDate(parsedDate);
    }
    
    const expenseRef = doc(db, 'expenses', docId);
    await updateDoc(expenseRef, {
      date: dateToStore,
      category: category,
      amount: parseFloat(amount),
      comment: comment || 'N/A',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating expense: ', error);
    throw error;
  }
};

// Delete expense from Firestore
export const deleteExpense = async (docId) => {
  try {
    await deleteDoc(doc(db, 'expenses', docId));
  } catch (error) {
    console.error('Error deleting expense: ', error);
    throw error;
  }
}; 