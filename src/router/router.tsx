import { Routes, Route, HashRouter, Navigate } from "react-router-dom";
import Mainpage from "../pages/Mainpage";
import UploadPage from "../pages/UploadPage";

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/" element={<Mainpage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
