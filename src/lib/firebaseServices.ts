
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { Expense, Budget } from "@/types/finance";

// Expenses Collection
const expensesCollection = collection(db, "expenses");
const budgetsCollection = collection(db, "budgets");

// Add a new expense
export const addExpense = async (expense: Omit<Expense, "id">) => {
  return await addDoc(expensesCollection, {
    ...expense,
    date: expense.date,
    createdAt: Timestamp.now()
  });
};

// Update an expense
export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  const expenseDoc = doc(db, "expenses", id);
  return await updateDoc(expenseDoc, expense);
};

// Delete an expense
export const deleteExpense = async (id: string) => {
  const expenseDoc = doc(db, "expenses", id);
  return await deleteDoc(expenseDoc);
};

// Get all expenses for a user
export const getExpensesForUser = async (userId: string) => {
  const q = query(
    expensesCollection,
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
};

// Subscribe to real-time expenses updates
export const subscribeToExpenses = (
  userId: string, 
  callback: (expenses: Expense[]) => void
) => {
  // Remove the orderBy to avoid needing a composite index
  const q = query(
    expensesCollection,
    where("userId", "==", userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[];
    
    // Sort on the client side instead of using orderBy
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    callback(expenses);
  }, (error) => {
    console.error("Error subscribing to expenses:", error);
  });
};

// Add a new budget
export const addBudget = async (budget: Omit<Budget, "id">) => {
  return await addDoc(budgetsCollection, {
    ...budget,
    createdAt: Timestamp.now()
  });
};

// Update a budget
export const updateBudget = async (id: string, budget: Partial<Budget>) => {
  const budgetDoc = doc(db, "budgets", id);
  return await updateDoc(budgetDoc, budget);
};

// Delete a budget
export const deleteBudget = async (id: string) => {
  const budgetDoc = doc(db, "budgets", id);
  return await deleteDoc(budgetDoc);
};

// Get all budgets for a user
export const getBudgetsForUser = async (userId: string) => {
  const q = query(
    budgetsCollection,
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Budget[];
};

// Subscribe to real-time budget updates
export const subscribeToBudgets = (
  userId: string, 
  callback: (budgets: Budget[]) => void
) => {
  // Remove the orderBy to avoid needing a composite index
  const q = query(
    budgetsCollection,
    where("userId", "==", userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const budgets = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Budget[];
    
    // Sort on the client side instead of using orderBy
    budgets.sort((a, b) => b.month.localeCompare(a.month));
    
    callback(budgets);
  }, (error) => {
    console.error("Error subscribing to budgets:", error);
  });
};
