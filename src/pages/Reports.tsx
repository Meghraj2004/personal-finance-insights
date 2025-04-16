
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseByCategory } from "@/components/dashboard/ExpenseByCategory";
import { Expense, Budget, MonthlyTotal } from "@/types/finance";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToExpenses, subscribeToBudgets } from "@/lib/firebaseServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, subMonths, startOfMonth, eachMonthOfInterval } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Reports = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"3months" | "6months" | "12months">("6months");

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

  // Generate monthly expense totals
  const getMonthlyData = () => {
    // Generate an array of the last X months
    const months = getLastMonths(period);
    
    // Calculate total expenses for each month
    const monthlyTotals: MonthlyTotal[] = months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const monthExpenses = expenses.filter(expense => expense.date.startsWith(monthStr));
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: format(month, "MMM yyyy"),
        total
      };
    });
    
    return monthlyTotals;
  };

  // Get array of last X months
  const getLastMonths = (period: "3months" | "6months" | "12months") => {
    const now = new Date();
    const monthsToSubtract = period === "3months" ? 2 : period === "6months" ? 5 : 11;
    const startDate = startOfMonth(subMonths(now, monthsToSubtract));
    
    return eachMonthOfInterval({
      start: startDate,
      end: now
    });
  };

  // Get monthly data for chart
  const monthlyData = getMonthlyData();

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Visualize your spending patterns
            </p>
          </div>
          <Select
            defaultValue="6months"
            onValueChange={(value) => setPeriod(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Monthly Expense Trend */}
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl">Monthly Expense Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      total: {
                        label: "Monthly Total",
                        theme: {
                          light: "#8884d8",
                          dark: "#8884d8"
                        }
                      }
                    }}
                  >
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent 
                            formatter={(value) => `$${Number(value).toFixed(2)}`}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="total"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution Chart */}
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ExpenseByCategory 
                    expenses={expenses} 
                    budgets={budgets}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Category Comparison */}
            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl">Monthly Category Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      amount: {
                        label: "Amount",
                        theme: {
                          light: "#82ca9d",
                          dark: "#82ca9d"
                        }
                      }
                    }}
                  >
                    <BarChart
                      data={expenses
                        .filter(expense => expense.date.startsWith(format(new Date(), 'yyyy-MM')))
                        .reduce((acc, expense) => {
                          const existingCategory = acc.find(item => item.category === expense.category);
                          if (existingCategory) {
                            existingCategory.amount += expense.amount;
                          } else {
                            acc.push({
                              category: expense.category,
                              amount: expense.amount
                            });
                          }
                          return acc;
                        }, [] as { category: string; amount: number }[])
                        .sort((a, b) => b.amount - a.amount)
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => `$${Number(value).toFixed(2)}`}
                          />
                        }
                      />
                      <Bar 
                        dataKey="amount"
                        name="amount"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;
