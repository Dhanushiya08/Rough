import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StepProgressBar from "../components/ StepProgressBar";
import Dashboard from "./Dashboard";
import LoginPage from "./Login";
import { useAppStore } from "../store/useAppStore";
import { FloatButton } from "antd";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

type UserType = {
  username: string;
  password: string;
  role: string;
};

function MainContent({ onLogout }: { onLogout: () => void }) {
  const { showStepper, closeStepper } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-none">
        <Navbar onLogout={onLogout} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {!showStepper && <Dashboard />}

        {showStepper && (
          <>
            <div className="h-full overflow-hidden">
              <StepProgressBar />
            </div>

            <FloatButton
              icon={<ArrowLeft className="text-primary" size={18} />}
              onClick={closeStepper}
              tooltip="Back to Dashboard"
              style={{ left: 24, bottom: 24 }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(() => {
    const savedUser = localStorage.getItem("loggedInUser");
    const loginTime = localStorage.getItem("loginTime");

    if (!savedUser || !loginTime) return null;

    const isExpired = Date.now() - Number(loginTime) > 2 * 60 * 60 * 1000;

    if (isExpired) {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loginTime");
      return null;
    }

    return JSON.parse(savedUser);
  });

  useEffect(() => {
    if (!loggedInUser) return;

    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    localStorage.setItem("loginTime", Date.now().toString());

    const timer = setTimeout(
      () => {
        setLoggedInUser(null);
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("loginTime");
        toast.error("Session expired. Auto logged out after 2 hours");
      },
      2 * 60 * 60 * 1000,
    );

    return () => clearTimeout(timer);
  }, [loggedInUser]);

  if (!loggedInUser) {
    return <LoginPage onLogin={setLoggedInUser} />;
  }

  return (
    <MainContent
      onLogout={() => {
        setLoggedInUser(null);
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("loginTime");
      }}
    />
  );
}
