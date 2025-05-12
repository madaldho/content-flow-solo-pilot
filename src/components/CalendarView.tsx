import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContent } from "@/context/ContentContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ContentItem } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarViewProps {
  onSelectContent: (id: string) => void;
}

export function CalendarView({ onSelectContent }: CalendarViewProps) {
  const { contentItems } = useContent();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Ensure contentItems is an array
  const safeContentItems = Array.isArray(contentItems) ? contentItems : [];

  // Function to find content that should be published on a specific date
  const getContentForDate = (date: Date): ContentItem[] => {
    if (!date) return [];
    
    return safeContentItems.filter((item) => {
      if (!item || !item.publicationDate) return false;
      
      // Compare year, month, and day only
      const itemDate = new Date(item.publicationDate);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
  };

  // Format dates for display in calendar
  const dateHasContent = (date: Date): boolean => {
    return getContentForDate(date).length > 0;
  };

  // Get content for the selected date
  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <Card className="w-full lg:w-2/5 bg-background/70">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-lg md:text-xl">{t("publishingCalendar")}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="flex justify-center lg:justify-start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
              className="rounded-md border max-w-full"
            modifiers={{
              hasContent: (date) => dateHasContent(date)
            }}
            modifiersStyles={{
              hasContent: { 
                fontWeight: 'bold',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderColor: 'rgba(99, 102, 241, 0.5)'
              }
            }}
          />
          </div>
        </CardContent>
      </Card>
      <Card className="w-full lg:w-3/5 bg-background/70">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-lg md:text-xl">
            {selectedDate ? (
              <span>{t("contentForDate").replace('{date}', format(selectedDate, "MMMM d, yyyy"))}</span>
            ) : (
              <span>{t("selectDate")}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto">
          {selectedDateContent.length === 0 ? (
            <p className="text-muted-foreground text-sm md:text-base">{t("noContentScheduled")}</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {selectedDateContent.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 md:p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelectContent(item.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium line-clamp-1">{item.title}</h3>
                    <Badge className="w-fit">{item.platform}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>Status: {t(item.status.toLowerCase().replace(/\s+/g, ""))}</span>
                    {item.tags && item.tags.length > 0 && (
                      <Badge variant="outline" className="w-fit">{item.tags[0]}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
