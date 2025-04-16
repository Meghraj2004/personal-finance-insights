
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "@/types/finance";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToExpenses, subscribeToBudgets } from "@/lib/firebaseServices";
import { Expense, Budget } from "@/types/finance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const Categories = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current month in YYYY-MM format
  const currentMonth = format(new Date(), "yyyy-MM");

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeExpenses = subscribeToExpenses(currentUser.uid, (fetchedExpenses) => {
      setExpenses(fetchedExpenses);
      setIsLoading(false);
    });

    const unsubscribeBudgets = subscribeToBudgets(currentUser.uid, (fetchedBudgets) => {
      setBudgets(fetchedBudgets);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeBudgets();
    };
  }, [currentUser]);

  // Calculate category statistics
  const categoryStats = EXPENSE_CATEGORIES.map(category => {
    // Get expenses for this category in current month
    const categoryExpenses = expenses.filter(
      expense => expense.category === category && expense.date.startsWith(currentMonth)
    );
    
    // Calculate total spent in this category
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Get budget for this category in current month
    const categoryBudget = budgets.find(
      budget => budget.category === category && budget.month === currentMonth
    );

    // Calculate percentage of budget used
    const percentUsed = categoryBudget ? (totalSpent / categoryBudget.amount) * 100 : 0;

    // Get total expense count for this category
    const totalTransactions = categoryExpenses.length;

    // Get all time spending for this category
    const allTimeSpent = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      category,
      totalSpent,
      budgetAmount: categoryBudget?.amount || 0,
      percentUsed: Math.min(percentUsed, 100),
      overBudget: percentUsed > 100,
      totalTransactions,
      allTimeSpent
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage and track your spending by category
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Categories Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Categories Overview</CardTitle>
                <CardDescription>View spending by category for {format(new Date(), "MMMM yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryStats.map((stat) => (
                      <TableRow key={stat.category}>
                        <TableCell className="font-medium">{stat.category}</TableCell>
                        <TableCell>${stat.totalSpent.toFixed(2)}</TableCell>
                        <TableCell>
                          {stat.budgetAmount ? `$${stat.budgetAmount.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell>
                          {stat.budgetAmount > 0 ? (
                            <div className="w-full">
                              <div className="flex justify-between text-xs mb-1">
                                <span>{stat.percentUsed.toFixed(0)}%</span>
                                {stat.overBudget && (
                                  <span className="text-destructive">Over budget</span>
                                )}
                              </div>
                              <Progress
                                value={stat.percentUsed}
                                className={stat.overBudget ? "bg-muted text-destructive" : "bg-muted"}
                              />
                            </div>
                          ) : (
                            "No budget set"
                          )}
                        </TableCell>
                        <TableCell className="text-right">{stat.totalTransactions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Category Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryStats
                .filter(stat => stat.totalTransactions > 0)
                .map((stat) => (
                <Card key={stat.category} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">{stat.category}</CardTitle>
                    <CardDescription>
                      ${stat.allTimeSpent.toFixed(2)} all time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">This Month</span>
                          <span className="font-medium">${stat.totalSpent.toFixed(2)}</span>
                        </div>
                        {stat.budgetAmount > 0 && (
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Budget: ${stat.budgetAmount.toFixed(2)}</span>
                              <span className={stat.overBudget ? "text-destructive" : "text-primary"}>
                                {stat.percentUsed.toFixed(0)}% used
                              </span>
                            </div>
                            <Progress
                              value={stat.percentUsed}
                              className={stat.overBudget ? "bg-muted text-destructive" : "bg-muted"}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Transactions: </span>
                        <span>{stat.totalTransactions} this month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Categories;
