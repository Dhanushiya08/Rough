import { useState } from "react";
import customerLogo from "../assets/image 1.png";
import companyLogo from "../assets/image 2.png";
import { LogOut, Menu, X } from "lucide-react";
import "../App.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-borderer shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 md:h-20 lg:h-24">
        {/* Logos */}
        <div className="flex items-center gap-3">
          <img
            src={customerLogo}
            alt="Customer Logo"
            className="h-10 w-10 md:h-14 md:w-14 lg:h-20 lg:w-20 object-contain"
          />
          <div className="h-8 md:h-10 lg:h-12 w-px bg-borderer" />
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-8 md:h-10 lg:h-14 w-auto hidden sm:block object-contain"
          />
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm lg:text-base text-gray-700">
            demo@1cloudhub.com
          </span>
          <button
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
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-3 border-t border-borderer bg-white">
          <span className="text-sm text-gray-700">demo@1cloudhub.com</span>
          <button
            aria-label="Log out"
            className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors w-fit"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
