import { Link } from "react-router-dom";
import { ROUTES } from "../../router/RoutePaths";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to={ROUTES.DASHBOARD}
        className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-blue-800 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
