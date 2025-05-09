
import { useState } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ContentForm } from "@/components/ContentForm";
import { useLanguage } from "@/context/LanguageContext";

export default function CalendarPage() {
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">{t("calendar")}</h1>
          
          <Button 
            onClick={() => setIsAddingContent(true)}
            className="rounded-xl transition-all hover:shadow-lg"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("addContent")}
          </Button>
        </div>
        
        <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border/40 h-[calc(100vh-12rem)] overflow-auto glassmorphism">
          <CalendarView />
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
