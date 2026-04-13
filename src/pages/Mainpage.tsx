import Navbar from "../components/Navbar";
import StepProgressBar from "../components/ StepProgressBar";
import Dashboard from "./Dashboard";
import { useAppStore } from "../store/useAppStore";
import { FloatButton } from "antd";
import { ArrowLeft } from "lucide-react";

export default function Mainpage() {
  const { showStepper, closeStepper } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-none">
        <Navbar />
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
