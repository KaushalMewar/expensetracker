import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Add monthly budget to Firestore
export const addMonthlyBudget = async (month, year, amount) => {
  try {
    const budgetData = {
      month: month,
      year: year,
      amount: parseFloat(amount),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'monthly_budgets'), budgetData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding monthly budget: ', error);
    throw error;
  }
};

// Get all monthly budgets from Firestore
export const getMonthlyBudgets = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'monthly_budgets'));
    
    const budgets = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      budgets.push({
        id: doc.id,
        ...data
      });
    });
    
    return budgets;
  } catch (error) {
    console.error('Error getting monthly budgets: ', error);
    throw error;
  }
};

// Get budget for specific month and year
export const getBudgetForMonth = async (month, year) => {
  try {
    const q = query(
      collection(db, 'monthly_budgets'),
      where('month', '==', month),
      where('year', '==', year)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const budgetDoc = querySnapshot.docs[0];
    const budgetData = budgetDoc.data();
    
    return {
      id: budgetDoc.id,
      ...budgetData
    };
  } catch (error) {
    console.error('Error getting budget for month: ', error);
    throw error;
  }
};

// Update monthly budget
export const updateMonthlyBudget = async (budgetId, month, year, amount) => {
  try {
    const budgetRef = doc(db, 'monthly_budgets', budgetId);
    await updateDoc(budgetRef, {
      month: month,
      year: year,
      amount: parseFloat(amount),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating monthly budget: ', error);
    throw error;
  }
};

// Delete monthly budget
export const deleteMonthlyBudget = async (budgetId) => {
  try {
    await deleteDoc(doc(db, 'monthly_budgets', budgetId));
  } catch (error) {
    console.error('Error deleting monthly budget: ', error);
    throw error;
  }
};

// Get current month's budget
export const getCurrentMonthBudget = async () => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();
    
    return await getBudgetForMonth(currentMonth, currentYear);
  } catch (error) {
    console.error('Error getting current month budget: ', error);
    throw error;
  }
};

// Get budget for specific month (by month number 1-12)
export const getBudgetByMonthNumber = async (monthNumber, year) => {
  try {
    return await getBudgetForMonth(monthNumber, year);
  } catch (error) {
    console.error('Error getting budget by month number: ', error);
    throw error;
  }
}; 