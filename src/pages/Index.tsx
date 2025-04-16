import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, ArrowRight, BarChart, Lock, ShieldCheck } from "lucide-react";

const Index = () => {
  const { currentUser } = useAuth();

  // Redirect to dashboard if user is already authenticated
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 text-primary" />
          <span className="ml-2 text-2xl font-bold">Finance Tracker</span>
        </div>
        <Link to="/auth">
          <Button>
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          Take Control of Your <span className="text-primary">Finances</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Track expenses, plan budgets, and gain insights into your spending habits with our powerful finance tracker.
        </p>
        <Link to="/auth">
          <Button size="lg" className="px-8 py-6 text-lg">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Dashboard</h3>
            <p className="text-gray-600">
              Get an instant overview of your financial health with our interactive dashboard.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Budget Planning</h3>
            <p className="text-gray-600">
              Set monthly budgets by category and track your progress over time.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your financial data is encrypted and secure with Firebase authentication.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to manage your finances better?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of users who are taking control of their financial future.
        </p>
        <Link to="/auth">
          <Button size="lg">
            Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
