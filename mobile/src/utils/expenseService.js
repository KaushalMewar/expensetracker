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
    console.log('=== ADDING EXPENSE ===');
    console.log('Date:', date, 'Type:', typeof date);
    console.log('Category:', category);
    console.log('Amount:', amount);
    console.log('Comment:', comment);
    
    // Convert date to Firestore Timestamp if it's a Date object
    let dateToStore = date;
    if (date instanceof Date) {
      dateToStore = Timestamp.fromDate(date);
      console.log('Converted Date to Timestamp:', dateToStore);
    } else if (typeof date === 'string') {
      // Handle string dates by parsing them
      const parsedDate = new Date(date);
      dateToStore = Timestamp.fromDate(parsedDate);
      console.log('Converted string date to Timestamp:', dateToStore);
    }
    
    const expenseData = {
      date: dateToStore,
      category: category,
      amount: parseFloat(amount),
      comment: comment || 'N/A',
      createdAt: Timestamp.now()
    };
    
    console.log('Expense data to save:', expenseData);
    
    const docRef = await addDoc(collection(db, 'expenses'), expenseData);
    console.log('Expense added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense: ', error);
    throw error;
  }
};

// Get all expenses from Firestore (for backward compatibility)
export const getExpenses = async () => {
  try {
    console.log('=== GETTING ALL EXPENSES ===');
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    
    console.log('Total documents found:', querySnapshot.size);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document ID:', doc.id);
      console.log('  - Date:', data.date, 'Type:', typeof data.date);
      console.log('  - Category:', data.category);
      console.log('  - Amount:', data.amount);
      console.log('  - Comment:', data.comment);
      console.log('  - CreatedAt:', data.createdAt);
      
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total expenses retrieved:', expenses.length);
    return expenses;
  } catch (error) {
    console.error('Error getting expenses: ', error);
    throw error;
  }
};

// Get expenses by date range with server-side filtering
export const getExpensesByDateRange = async (startDate, endDate) => {
  try {
    console.log('=== GETTING EXPENSES BY DATE RANGE ===');
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    
    // Convert dates to Firestore Timestamps if they're Date objects
    const startTimestamp = startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const endTimestamp = endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;
    
    console.log('Start timestamp:', startTimestamp);
    console.log('End timestamp:', endTimestamp);
    
    const q = query(
      collection(db, 'expenses'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Documents found in date range:', querySnapshot.size);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document ID:', doc.id, 'Date:', data.date);
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total expenses in date range:', expenses.length);
    return expenses;
  } catch (error) {
    console.error('Error getting expenses by date range: ', error);
    throw error;
  }
};

// Get expenses by category with server-side filtering
export const getExpensesByCategory = async (category) => {
  try {
    console.log('=== GETTING EXPENSES BY CATEGORY ===');
    console.log('Category:', category);
    
    const q = query(
      collection(db, 'expenses'),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Documents found for category:', querySnapshot.size);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document ID:', doc.id, 'Category:', data.category);
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total expenses for category:', expenses.length);
    return expenses;
  } catch (error) {
    console.error('Error getting expenses by category: ', error);
    throw error;
  }
};

// Get expenses by date range AND category (combined filtering)
export const getExpensesByDateRangeAndCategory = async (startDate, endDate, category) => {
  try {
    console.log('=== GETTING EXPENSES BY DATE RANGE AND CATEGORY ===');
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    console.log('Category:', category);
    
    // Convert dates to Firestore Timestamps if they're Date objects
    const startTimestamp = startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const endTimestamp = endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;
    
    console.log('Start timestamp:', startTimestamp);
    console.log('End timestamp:', endTimestamp);
    
    const q = query(
      collection(db, 'expenses'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      where('category', '==', category),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Documents found in date range and category:', querySnapshot.size);
    
    const expenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document ID:', doc.id, 'Date:', data.date, 'Category:', data.category);
      expenses.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total expenses in date range and category:', expenses.length);
    return expenses;
  } catch (error) {
    console.error('Error getting expenses by date range and category: ', error);
    throw error;
  }
};

// Get expenses for specific time periods (DAILY, WEEKLY, MONTHLY, YEAR)
export const getExpensesByTimeFilter = async (timeFilter) => {
  try {
    console.log('=== GETTING EXPENSES BY TIME FILTER ===');
    console.log('Time filter:', timeFilter);
    
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
        
      case 'MONTHLY':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        endDate = new Date(now.getFullYear(), now.getMonth(), lastDayOfMonth);
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
    
    console.log('Calculated start date:', startDate.toISOString());
    console.log('Calculated end date:', endDate.toISOString());
    
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