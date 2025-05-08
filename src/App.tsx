
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ContentBoardPage from "./pages/ContentBoardPage";
import CalendarPage from "./pages/CalendarPage";
import { ContentProvider } from "./context/ContentContext";
import { OfflineIndicator } from "./components/OfflineIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ContentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/content-board" element={<ContentBoardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <OfflineIndicator />
      </ContentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
