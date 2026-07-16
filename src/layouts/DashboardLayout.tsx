import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ROUTES } from "../router/RoutePaths";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loginTime");
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-none">
        <Navbar onLogout={handleLogout} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
