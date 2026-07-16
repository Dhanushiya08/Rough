import { useState } from "react";
import customerLogo from "../assets/image 1.png";
import companyLogo from "../assets/image 2.png";
import { LogOut, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../router/RoutePaths";
import "../App.css";

type NavbarProps = {
  onLogout: () => void;
};
// type UserType = {
//   username: string;
//   password: string;
//   role: string;
// };

export default function Navbar({ onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const storedUser = localStorage.getItem("loggedInUser");

  const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
  console.log(loggedInUser?.username);

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm relative z-50">
      <div className="flex items-center justify-between px-6 md:px-10 h-16 md:h-20">
        <div className="flex items-center gap-2">
          <img
            src={customerLogo}
            alt="Customer Logo"
            className="max-h-8 md:max-h-10 lg:max-h-12 w-auto object-contain"
          />

          <div className="h-8 md:h-10 w-px bg-gray-200" />

          <img
            src={companyLogo}
            alt="Company Logo"
            className="max-h-8 md:max-h-10 lg:max-h-12 w-auto object-contain"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 flex-1 ml-10 h-full">
          <NavLink
            to={ROUTES.DASHBOARD}
            end
            className={({ isActive }) =>
              `relative flex items-center h-full text-sm font-semibold transition-all duration-200 ${
                isActive ? "text-primary" : "text-gray-500 hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Dashboard
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-md" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to={ROUTES.PROMPT_MANAGEMENT}
            className={({ isActive }) =>
              `relative flex items-center h-full text-sm font-semibold transition-all duration-200 ${
                isActive ? "text-primary" : "text-gray-500 hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Prompt Management
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-md" />
                )}
              </>
            )}
          </NavLink>
        </div>

        {/* Desktop Profile & Logout */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm lg:text-base text-gray-700">
            {loggedInUser?.username || "Guest user"}
          </span>

          <button
            onClick={onLogout}
            aria-label="Log out"
            className="text-secondary hover:text-primary transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-600 hover:text-primary transition-colors p-1"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-3 border-t border-borderer bg-white">
          <NavLink
            to={ROUTES.DASHBOARD}
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-primary" : "text-gray-600"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to={ROUTES.PROMPT_MANAGEMENT}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-primary" : "text-gray-600"
              }`
            }
          >
            Prompt Management
          </NavLink>
          <hr className="border-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{loggedInUser?.username || "Guest user"}</span>

          <button
            onClick={onLogout}
            aria-label="Log out"
            className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors w-fit"
          >
            <LogOut size={16} />
            Log out
          </button>
          </div>
        </div>
      )}
    </nav>
  );
}
