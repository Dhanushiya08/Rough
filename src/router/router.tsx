import { Routes, Route, HashRouter, Navigate } from "react-router-dom";
import Mainpage from "../pages/Mainpage";

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
