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
    console.log('=== ADDING MONTHLY BUDGET ===');
    console.log('Month:', month);
    console.log('Year:', year);
    console.log('Amount:', amount);
    
    const budgetData = {
      month: month,
      year: year,
      amount: parseFloat(amount),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('Budget data to save:', budgetData);
    
    const docRef = await addDoc(collection(db, 'monthly_budgets'), budgetData);
    console.log('Budget added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding monthly budget: ', error);
    throw error;
  }
};

// Get all monthly budgets from Firestore
export const getMonthlyBudgets = async () => {
  try {
    console.log('=== GETTING MONTHLY BUDGETS ===');
    const querySnapshot = await getDocs(collection(db, 'monthly_budgets'));
    
    console.log('Total budget documents found:', querySnapshot.size);
    
    const budgets = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Document ID:', doc.id);
      console.log('  - Month:', data.month);
      console.log('  - Year:', data.year);
      console.log('  - Amount:', data.amount);
      console.log('  - CreatedAt:', data.createdAt);
      
      budgets.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log('Total budgets retrieved:', budgets.length);
    return budgets;
  } catch (error) {
    console.error('Error getting monthly budgets: ', error);
    throw error;
  }
};

// Get budget for specific month and year
export const getBudgetForMonth = async (month, year) => {
  try {
    console.log('=== GETTING BUDGET FOR MONTH ===');
    console.log('Month:', month);
    console.log('Year:', year);
    
    const q = query(
      collection(db, 'monthly_budgets'),
      where('month', '==', month),
      where('year', '==', year)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Budget documents found for month:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No budget found for this month');
      return null;
    }
    
    const budgetDoc = querySnapshot.docs[0];
    const budgetData = budgetDoc.data();
    
    console.log('Budget found:', budgetData);
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
    console.log('=== UPDATING MONTHLY BUDGET ===');
    console.log('Budget ID:', budgetId);
    console.log('Month:', month);
    console.log('Year:', year);
    console.log('Amount:', amount);
    
    const budgetRef = doc(db, 'monthly_budgets', budgetId);
    await updateDoc(budgetRef, {
      month: month,
      year: year,
      amount: parseFloat(amount),
      updatedAt: Timestamp.now()
    });
    
    console.log('Budget updated successfully');
  } catch (error) {
    console.error('Error updating monthly budget: ', error);
    throw error;
  }
};

// Delete monthly budget
export const deleteMonthlyBudget = async (budgetId) => {
  try {
    console.log('=== DELETING MONTHLY BUDGET ===');
    console.log('Budget ID:', budgetId);
    
    await deleteDoc(doc(db, 'monthly_budgets', budgetId));
    console.log('Budget deleted successfully');
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
    
    console.log('=== GETTING CURRENT MONTH BUDGET ===');
    console.log('Current month:', currentMonth);
    console.log('Current year:', currentYear);
    
    return await getBudgetForMonth(currentMonth, currentYear);
  } catch (error) {
    console.error('Error getting current month budget: ', error);
    throw error;
  }
};

// Get budget for specific month (by month number 1-12)
export const getBudgetByMonthNumber = async (monthNumber, year) => {
  try {
    console.log('=== GETTING BUDGET BY MONTH NUMBER ===');
    console.log('Month number:', monthNumber);
    console.log('Year:', year);
    
    return await getBudgetForMonth(monthNumber, year);
  } catch (error) {
    console.error('Error getting budget by month number: ', error);
    throw error;
  }
}; 