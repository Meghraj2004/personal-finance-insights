
import { AppLayout } from "@/components/layout/AppLayout";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";

const Expenses = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage and track your expenses
          </p>
        </div>

        <div className="p-4 border rounded-md bg-card">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <ExpenseForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Expense History</h2>
          <ExpenseList />
        </div>
      </div>
    </AppLayout>
  );
};

export default Expenses;
