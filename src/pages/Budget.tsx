
import { AppLayout } from "@/components/layout/AppLayout";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { BudgetList } from "@/components/budget/BudgetList";

const Budget = () => {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Planning</h1>
          <p className="text-muted-foreground">
            Set and manage your monthly budgets by category
          </p>
        </div>

        <div className="p-4 border rounded-md bg-card">
          <h2 className="text-xl font-semibold mb-4">Set New Budget</h2>
          <BudgetForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
          <BudgetList />
        </div>
      </div>
    </AppLayout>
  );
};

export default Budget;
