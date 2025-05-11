
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContentBoardPage from "./pages/ContentBoardPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import { CombinedContextWrapper } from "./context/CombinedContextWrapper";
import SettingsPage from "./pages/SettingsPage";
import ContentFormPage from "./pages/ContentFormPage";

function App() {
  return (
    <CombinedContextWrapper>
      <div className="font-sans"> {/* Ensure consistent font usage */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content-board" element={<ContentBoardPage />} />
          <Route path="/content/new" element={<ContentFormPage />} />
          <Route path="/content/edit/:id" element={<ContentFormPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </CombinedContextWrapper>
  );
}

export default App;
