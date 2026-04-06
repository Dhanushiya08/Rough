import { BrowserRouter, Routes, Route } from "react-router-dom";
// import UploadPage from "../pages/UploadPage";
// import CreatePostPage from "../pages/CreatePostpage";
// import StepProgressBar from "../components/ StepProgressBar";
import Mainpage from "../pages/Mainpage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/upload" element={<UploadPage />} /> */}
        <Route path="/" element={<Mainpage />} />
      </Routes>
    </BrowserRouter>
  );
}
