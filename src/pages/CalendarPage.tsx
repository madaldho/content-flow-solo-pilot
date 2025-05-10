
import { useState } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { ContentDetails } from "@/components/ContentDetails";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { useLanguage } from "@/context/LanguageContext";

export default function CalendarPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">{t("calendar")}</h1>
          
          <Button onClick={() => setIsAddingContent(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("addContent")}
          </Button>
        </div>
        
        <CalendarView onSelectContent={(id) => setSelectedContentId(id)} />
      </main>
      
      {/* Content Details Dialog */}
      <ContentDetails
        contentId={selectedContentId}
        onClose={() => setSelectedContentId(null)}
      />
      
      {/* Add Content Dialog */}
      {isAddingContent && (
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
