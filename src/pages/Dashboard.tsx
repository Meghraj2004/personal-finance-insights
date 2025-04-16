
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToExpenses, subscribeToBudgets } from "@/lib/firebaseServices";
import { Expense, Budget } from "@/types/finance";
import { format } from "date-fns";
import { CreditCard, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { ExpenseByCategory } from "@/components/dashboard/ExpenseByCategory";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current month in YYYY-MM format
  const currentMonth = format(new Date(), "yyyy-MM");

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeExpenses = subscribeToExpenses(
      currentUser.uid,
      (fetchedExpenses) => {
        setExpenses(fetchedExpenses);
        setIsLoading(false);
      }
    );

    const unsubscribeBudgets = subscribeToBudgets(
      currentUser.uid,
      (fetchedBudgets) => {
        setBudgets(fetchedBudgets);
      }
    );

    return () => {
      unsubscribeExpenses();
      unsubscribeBudgets();
    };
  }, [currentUser]);

  // Calculate summary statistics
  const calculateStats = () => {
    // Filter current month expenses
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(currentMonth)
    );

    // Calculate total expenses for current month
    const totalMonthlyExpense = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount, 
      0
    );

    // Calculate total budget for current month
    const totalMonthlyBudget = budgets
      .filter(budget => budget.month === currentMonth)
      .reduce((sum, budget) => sum + budget.amount, 0);

    // Calculate budget usage percentage
    const budgetUsagePercent = totalMonthlyBudget > 0 
      ? (totalMonthlyExpense / totalMonthlyBudget) * 100 
      : 0;

    // Calculate average daily expense for current month
    const daysInMonth = new Date(
      parseInt(currentMonth.split('-')[0]), 
      parseInt(currentMonth.split('-')[1]), 
      0
    ).getDate();
    
    const averageDailyExpense = totalMonthlyExpense / daysInMonth;

    return {
      totalMonthlyExpense,
      totalMonthlyBudget,
      budgetUsagePercent,
      averageDailyExpense,
    };
  };

  const stats = calculateStats();

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.displayName || 'User'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Monthly Expense Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Expenses
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalMonthlyExpense.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    For {format(new Date(), "MMMM yyyy")}
                  </p>
                </CardContent>
              </Card>

              {/* Budget Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Budget
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalMonthlyBudget.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.budgetUsagePercent > 0 ? (
                      <>
                        {stats.budgetUsagePercent.toFixed(0)}% used
                        {stats.budgetUsagePercent > 100 ? (
                          <span className="text-destructive"> (Over budget)</span>
                        ) : (
                          <span> (Under budget)</span>
                        )}
                      </>
                    ) : "No budget set"}
                  </p>
                </CardContent>
              </Card>

              {/* Average Daily Expense */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Daily Expense
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.averageDailyExpense.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Per day in {format(new Date(), "MMMM")}
                  </p>
                </CardContent>
              </Card>

              {/* Total Expenses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ExpenseByCategory 
                expenses={expenses} 
                budgets={budgets} 
                month={currentMonth}
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
