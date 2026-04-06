import StepProgressBar from "../components/ StepProgressBar";
import Navbar from "../components/Navbar";

export default function Mainpage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 🔝 Navbar */}
      <Navbar />
      {/* 🔽 Content */}
      <div className="flex-1">
        <StepProgressBar />
      </div>
    </div>
  );
}
