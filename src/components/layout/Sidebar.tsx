
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CreditCard, 
  BarChart4, 
  IndianRupee, 
  Menu, 
  X, 
  Home,
  PieChart,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Budget",
      path: "/budget",
      icon: <IndianRupee size={20} />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart4 size={20} />,
    },
    {
      name: "Categories",
      path: "/categories",
      icon: <PieChart size={20} />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    }
  ];

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed top-4 left-4 z-30 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-background shadow-md"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-20"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-20 h-full w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        collapsed ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex flex-col h-full py-4">
          {/* Logo */}
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold flex items-center">
              <IndianRupee className="mr-2 text-primary" />
              Finance Tracker
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 mt-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    onClick={() => setCollapsed(true)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.path 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="px-3 py-4 border-t border-border mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 mt-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
