import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BuilderProvider } from "./context/BuilderContext";
import SetupPage from "./pages/SetupPage";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import BuilderPage from "./pages/BuilderPage";

export default function App() {
  return (
    <BrowserRouter>
      <BuilderProvider>
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/setup/mode" element={<ModeSelectionPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BuilderProvider>
    </BrowserRouter>
  );
}
