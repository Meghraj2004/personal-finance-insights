
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee } from "lucide-react";

const Reports = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"3months" | "6months" | "12months">("6months");
  const [activeTab, setActiveTab] = useState("overview");

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

  // Format currency in Indian format
  const formatIndianCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Tooltip formatter for charts
  const currencyFormatter = (value: any) => {
    return formatIndianCurrency(Number(value));
  };

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

  // Calculate spending trends
  const getTrendData = () => {
    if (monthlyData.length < 2) return { trend: 0, average: 0 };
    
    const currentMonth = monthlyData[monthlyData.length - 1].total;
    const previousMonth = monthlyData[monthlyData.length - 2].total;
    const trend = previousMonth !== 0 
      ? ((currentMonth - previousMonth) / previousMonth) * 100 
      : 0;
    
    const average = monthlyData.reduce((sum, data) => sum + data.total, 0) / monthlyData.length;
    
    return { trend, average };
  };

  const { trend, average } = getTrendData();

  // Get current month's expense data by category
  const getCurrentMonthCategoryData = () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return expenses
      .filter(expense => expense.date.startsWith(currentMonth))
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
      .sort((a, b) => b.amount - a.amount);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <IndianRupee size={28} className="text-primary" />
              Reports
            </h1>
            <p className="text-muted-foreground">
              Visualize your spending patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={period}
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
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="detail">Detailed Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Overview Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {/* Monthly Average Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {formatIndianCurrency(average)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {period} data
                      </p>
                    </CardContent>
                  </Card>

                  {/* Monthly Trend Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold flex items-center ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compared to previous month
                      </p>
                    </CardContent>
                  </Card>

                  {/* Current Month Total Card */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Current Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        {formatIndianCurrency(monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].total : 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(), 'MMMM yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
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
                            tickFormatter={currencyFormatter}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent 
                                formatter={currencyFormatter}
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
              </TabsContent>
              
              <TabsContent value="detail" className="space-y-4 mt-4">
                {/* Category Breakdown */}
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
                    <CardTitle className="text-xl">Current Month - Category Comparison</CardTitle>
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
                        <BarChart data={getCurrentMonthCategoryData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="category"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            tickFormatter={currencyFormatter}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={currencyFormatter}
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
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Reports;
