import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { ROUTES } from "./RoutePaths";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    const loginTime = localStorage.getItem("loginTime");

    if (!savedUser || !loginTime) {
      setIsAuthenticated(false);
      return;
    }

    const isExpired = Date.now() - Number(loginTime) > 2 * 60 * 60 * 1000; // 2 hours

    if (isExpired) {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loginTime");
      toast.error("Session expired. Auto logged out after 2 hours");
      setIsAuthenticated(false);
      return;
    }

    // Set a timeout to auto logout
    const timeRemaining = 2 * 60 * 60 * 1000 - (Date.now() - Number(loginTime));
    const timer = setTimeout(() => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loginTime");
      toast.error("Session expired. Auto logged out after 2 hours");
      setIsAuthenticated(false);
    }, timeRemaining);

    setIsAuthenticated(true);

    return () => clearTimeout(timer);
  }, []);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
