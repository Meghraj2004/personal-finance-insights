
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, Budget, CategoryTotal } from "@/types/finance";
import { format } from "date-fns";

interface ExpenseByCategoryProps {
  expenses: Expense[];
  budgets: Budget[];
  month?: string; // Optional: Filter by month (YYYY-MM)
}

// Array of colors for the chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c'];

export const ExpenseByCategory = ({ expenses, budgets, month }: ExpenseByCategoryProps) => {
  const [data, setData] = useState<CategoryTotal[]>([]);
  
  useEffect(() => {
    // Filter expenses by the selected month if provided
    let filteredExpenses = expenses;
    if (month) {
      filteredExpenses = expenses.filter(expense => expense.date.startsWith(month));
    }

    // Get current month for budget comparison (if not specified)
    const currentMonth = month || format(new Date(), "yyyy-MM");
    const relevantBudgets = budgets.filter(budget => budget.month === currentMonth);
    
    // Group expenses by category and calculate totals
    const expensesByCategory = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    // Create data array with category totals
    const categoryData = Object.keys(expensesByCategory).map(category => {
      const budget = relevantBudgets.find(b => b.category === category);
      
      const categoryTotal: CategoryTotal = {
        category,
        total: expensesByCategory[category],
        budget: budget?.amount,
      };

      if (budget?.amount) {
        categoryTotal.percentage = (expensesByCategory[category] / budget.amount) * 100;
      }
      
      return categoryTotal;
    });
    
    // Sort by total (descending)
    const sortedData = categoryData.sort((a, b) => b.total - a.total);
    
    setData(sortedData);
  }, [expenses, budgets, month]);
  
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            No expense data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="category"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
