
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContentForm } from "@/components/ContentForm";
import { Header } from "@/components/Header";
import { useContent } from "@/context/ContentContext";
import { ContentItem } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ContentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contentItems } = useContent();
  const { t } = useLanguage();
  const [contentItem, setContentItem] = useState<ContentItem | undefined>(undefined);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // If we have an ID, try to find the content item
    if (id && contentItems) {
      const item = Array.isArray(contentItems) ? contentItems.find(item => item.id === id) : undefined;
      setContentItem(item);
    }

    // Set page title
    document.title = id ? `${t("editContent")} | ContentFlow` : `${t("addContent")} | ContentFlow`;
  }, [id, contentItems, t]);
  
  const handleClose = () => {
    navigate("/content-board");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container py-3 md:py-6 space-y-4 md:space-y-6 px-3 md:px-4">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2 rounded-full" 
              onClick={handleClose}
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-medium">
              {id ? t("editContent") : t("addContent")}
            </h1>
          </div>
        </div>
        
        <div className="bg-background/80 shadow-sm backdrop-blur-sm rounded-lg p-3 md:p-6 max-w-4xl mx-auto">
          <ContentForm 
            initialData={contentItem} 
            onClose={handleClose} 
          />
        </div>
      </main>
    </div>
  );
}
