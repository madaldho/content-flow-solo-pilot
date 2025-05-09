
import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { Button } from "@/components/ui/button";
import { PlusIcon, DownloadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { exportToCSV } = useContent();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setIsAddingContent(true)}
              className="rounded-xl transition-all hover:shadow-lg"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t("addContent")}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="rounded-xl"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("quickActions")}</h2>
            <DashboardStats />
          </div>
        </div>
      </main>
      
      {/* Add Content Dialog */}
      {isAddingContent && (
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto glassmorphism">
            <DialogHeader>
              <DialogTitle>{t("addContent")}</DialogTitle>
            </DialogHeader>
            <ContentForm 
              onClose={() => setIsAddingContent(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
