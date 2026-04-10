import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Mainpage from "../pages/Mainpage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
