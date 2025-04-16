
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Budget } from "@/types/finance";
import { format, parse } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToBudgets, deleteBudget } from "@/lib/firebaseServices";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export const BudgetList = () => {
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | "all">("all");

  // Generate list of months (past 6 months, current month, and future 5 months)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = -6; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    const unsubscribe = subscribeToBudgets(
      currentUser.uid,
      (fetchedBudgets) => {
        setBudgets(fetchedBudgets);
        setLoading(false);
      }
    );
    
    return unsubscribe;
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    
    try {
      await deleteBudget(id);
      toast.success("Budget deleted successfully");
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  const filteredBudgets = budgets.filter(budget => 
    selectedMonth === "all" || budget.month === selectedMonth
  );

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <div className="p-4 space-y-4">
        <div className="flex justify-end">
          <div className="w-full md:w-64">
            <Select 
              value={selectedMonth} 
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {selectedMonth !== "all" ? 
              "No budgets set for this month" : 
              "No budgets found. Set some budgets to get started!"}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budget Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => {
                  const monthDate = parse(budget.month, "yyyy-MM", new Date());
                  const displayMonth = format(monthDate, "MMMM yyyy");
                  
                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">
                        {displayMonth}
                      </TableCell>
                      <TableCell>{budget.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${budget.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
};
