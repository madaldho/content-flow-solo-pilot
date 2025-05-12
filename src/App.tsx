import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContentBoardPage from "./pages/ContentBoardPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import { CombinedContextWrapper } from "./context/CombinedContextWrapper";
import SettingsPage from "./pages/SettingsPage";
import ContentFormPage from "./pages/ContentFormPage";
import ContentMetricsPage from "./pages/ContentMetricsPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <CombinedContextWrapper>
      <div className="font-poppins min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content-board" element={<ContentBoardPage />} />
          <Route path="/content/new" element={<ContentFormPage />} />
          <Route path="/content/edit/:id" element={<ContentFormPage />} />
          <Route path="/content/detail/:id" element={<ContentDetailPage />} />
          <Route path="/content/metrics/:id" element={<ContentMetricsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" closeButton />
      </div>
    </CombinedContextWrapper>
  );
}

export default App;
