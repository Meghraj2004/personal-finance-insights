
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { currentUser } = useAuth();

  // Redirect if user is already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
          <p className="text-gray-600 mt-2">
            Track your expenses and manage your finances with ease
          </p>
        </div>
        
        {isLoginMode ? (
          <LoginForm onSwitchToSignup={() => setIsLoginMode(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLoginMode(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
