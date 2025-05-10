
import { useState } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { ContentDetails } from "@/components/ContentDetails";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { useLanguage } from "@/context/LanguageContext";

export default function CalendarPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glassmorphism p-4 rounded-xl shadow-sm">
          <h1 className="text-3xl font-elegant">{t("calendar")}</h1>
          
          <Button onClick={() => setIsAddingContent(true)} className="rounded-xl transition-all hover:shadow-lg">
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("addContent")}
          </Button>
        </div>
        
        <div className="glassmorphism p-4 rounded-xl shadow-sm">
          <CalendarView onSelectContent={(id) => setSelectedContentId(id)} />
        </div>
      </main>
      
      {/* Content Details Dialog */}
      <ContentDetails
        contentId={selectedContentId}
        onClose={() => setSelectedContentId(null)}
      />
      
      {/* Add Content Dialog */}
      {isAddingContent && (
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto glassmorphism">
            <DialogHeader>
              <DialogTitle className="font-elegant text-2xl">{t("addContent")}</DialogTitle>
              <DialogDescription>{t("addContentDescription")}</DialogDescription>
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
