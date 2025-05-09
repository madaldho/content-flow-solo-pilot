
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContentBoardPage from "./pages/ContentBoardPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import { CombinedContextWrapper } from "./context/CombinedContextWrapper";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <CombinedContextWrapper>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/content-board" element={<ContentBoardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CombinedContextWrapper>
  );
}

export default App;
