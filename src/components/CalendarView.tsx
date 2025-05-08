
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContent } from "@/context/ContentContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ContentItem } from "@/types/content";

interface CalendarViewProps {
  onSelectContent: (id: string) => void;
}

export function CalendarView({ onSelectContent }: CalendarViewProps) {
  const { contentItems } = useContent();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Function to find content that should be published on a specific date
  const getContentForDate = (date: Date): ContentItem[] => {
    if (!date) return [];
    
    return contentItems.filter((item) => {
      if (!item.publicationDate) return false;
      
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

  // Get days with content for styling in calendar
  const daysWithContent = contentItems
    .filter(item => item.publicationDate)
    .map(item => item.publicationDate as Date);

  // Get content for the selected date
  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Publishing Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
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
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle>
            {selectedDate ? (
              <span>Content for {format(selectedDate, "MMMM d, yyyy")}</span>
            ) : (
              <span>Select a date</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateContent.length === 0 ? (
            <p className="text-muted-foreground">No content scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {selectedDateContent.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 border rounded-lg cursor-pointer hover:border-primary"
                  onClick={() => onSelectContent(item.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <Badge>{item.platform}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Status: {item.status}</span>
                    {item.tags && item.tags.length > 0 && (
                      <Badge variant="outline">{item.tags[0]}</Badge>
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
