import { useState } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { ContentDetails } from "@/components/ContentDetails";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ContentForm } from "@/components/ContentForm";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { PublishActivityCalendar } from "@/components/PublishActivityCalendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentItem } from "@/types/content";

export default function CalendarPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { t } = useLanguage();
  const { contentItems } = useContent();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateContent, setSelectedDateContent] = useState<ContentItem[]>([]);
  
  // Ensure contentItems is loaded before rendering the calendar view
  const isContentLoaded = Array.isArray(contentItems);
  
  // Handler untuk memilih tanggal pada activity calendar
  const handleSelectDay = (date: Date, items: ContentItem[]) => {
    setSelectedDate(date);
    setSelectedDateContent(items);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container py-4 md:py-6 space-y-4 md:space-y-6 px-3 md:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glassmorphism p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl md:text-3xl font-elegant">{t("calendar")}</h1>
          
          <Button 
            onClick={() => setIsAddingContent(true)} 
            className="rounded-xl transition-all hover:shadow-lg w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t("addContent")}
          </Button>
        </div>
        
        <div className="glassmorphism p-3 md:p-4 rounded-xl shadow-sm">
          {isContentLoaded && (
            <CalendarView onSelectContent={(id) => setSelectedContentId(id)} />
          )}
        </div>
        
        {/* Panel konten pada tanggal tertentu */}
        {selectedDate && (
          <Card className="border border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {format(selectedDate, "d MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateContent.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateContent.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedContentId(item.id)}
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.isArray(item.platforms) && item.platforms.length > 0 ? (
                          item.platforms.map((platform, idx) => (
                            <Badge 
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {platform}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {item.platform}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {t("noContentPublished")}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Activity Calendar */}
        <div className="glassmorphism p-3 md:p-4 rounded-xl shadow-sm">
          {isContentLoaded && (
            <PublishActivityCalendar 
              contentItems={contentItems} 
              onSelectDay={handleSelectDay}
            />
          )}
        </div>
      </main>
      
      {/* Content Details Dialog */}
      {selectedContentId && (
        <ContentDetails
          contentId={selectedContentId}
          onClose={() => setSelectedContentId(null)}
        />
      )}
      
      {/* Add Content Dialog */}
      <Dialog open={isAddingContent} onOpenChange={(open) => {
        // Only set isAddingContent to false if dialog is closing
        if (!open) {
          setIsAddingContent(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto glassmorphism">
          <DialogHeader>
            <DialogTitle className="font-elegant text-2xl">{t("addContent")}</DialogTitle>
            <DialogDescription>{t("addContentDescription")}</DialogDescription>
          </DialogHeader>
          {isAddingContent && (
            <ContentForm 
              onClose={() => setIsAddingContent(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
