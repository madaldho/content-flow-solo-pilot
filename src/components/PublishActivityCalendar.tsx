import { useMemo, useState } from "react";
import { ContentItem } from "@/types/content";
import { 
  format, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay
} from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor } from "@/lib/platform-utils";

interface PublishActivityCalendarProps {
  contentItems: ContentItem[];
  onSelectDay?: (date: Date, items: ContentItem[]) => void;
}

export function PublishActivityCalendar({ contentItems, onSelectDay }: PublishActivityCalendarProps) {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Menghasilkan data kalender untuk bulan saat ini
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    // Menghasilkan array hari dalam interval
    const days = eachDayOfInterval({
      start: startDate,
      end: endDate
    });
    
    // Pengelompokan hari menjadi minggu
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    days.forEach((day) => {
      if (currentWeek.length === 0 && day.getDay() !== 0) {
        // Memastikan minggu dimulai dari Minggu
        for (let i = 0; i < day.getDay(); i++) {
          currentWeek.push(new Date(0)); // Placeholder untuk hari kosong
        }
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Jika ada hari yang tersisa, tambahkan ke minggu terakhir
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [currentMonth]);
  
  // Mengelompokkan konten berdasarkan tanggal publikasi
  const contentByDate = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    
    if (!Array.isArray(contentItems)) {
      return map;
    }
    
    contentItems.forEach(item => {
      if (item.status === "Published" && item.publicationDate) {
        const dateStr = format(new Date(item.publicationDate), "yyyy-MM-dd");
        if (!map.has(dateStr)) {
          map.set(dateStr, []);
        }
        map.get(dateStr)?.push(item);
      }
    });
    
    return map;
  }, [contentItems]);
  
  // Mendapatkan intensitas warna berdasarkan jumlah konten
  const getIntensityColor = (count: number) => {
    if (count === 0) return "#ebedf0";
    if (count < 2) return "#9be9a8";
    if (count < 4) return "#40c463";
    if (count < 6) return "#30a14e";
    return "#216e39";
  };
  
  // Mendapatkan konten pada tanggal tertentu
  const getContentForDay = (day: Date): ContentItem[] => {
    const dateStr = format(day, "yyyy-MM-dd");
    return contentByDate.get(dateStr) || [];
  };
  
  // Mendapatkan warna untuk hari berdasarkan jumlah konten yang dipublikasikan
  const getDayColor = (day: Date) => {
    const content = getContentForDay(day);
    return getIntensityColor(content.length);
  };
  
  // Handler untuk memilih tanggal
  const handleDayClick = (day: Date) => {
    if (onSelectDay) {
      const content = getContentForDay(day);
      onSelectDay(day, content);
    }
  };
  
  // Mendapatkan tooltip content
  const getTooltipContent = (day: Date) => {
    const content = getContentForDay(day);
    const dateStr = format(day, "d MMMM yyyy");
    
    if (content.length === 0) {
      return `${dateStr}: ${t("noContentPublished")}`;
    }
    
    return (
      <div>
        <div className="font-medium mb-1">{dateStr}</div>
        <div className="text-sm">{content.length} {t(content.length > 1 ? "contentsPublished" : "contentPublished")}</div>
        <div className="mt-1 space-y-1">
          {content.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1">
              {Array.isArray(item.platforms) && item.platforms.length > 0 ? (
                <span 
                  className="w-4 h-4 flex items-center justify-center rounded-full"
                  style={{ 
                    backgroundColor: getPlatformBgColor(item.platforms[0]),
                    color: getPlatformColor(item.platforms[0])
                  }}
                >
                  {getPlatformIcon(item.platforms[0])}
                </span>
              ) : (
                <span 
                  className="w-4 h-4 flex items-center justify-center rounded-full"
                  style={{ 
                    backgroundColor: getPlatformBgColor(item.platform),
                    color: getPlatformColor(item.platform)
                  }}
                >
                  {getPlatformIcon(item.platform)}
                </span>
              )}
              <span className="truncate max-w-[180px]">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Handler untuk navigasi bulan
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Nama-nama hari dalam seminggu
  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("publishActivity")}</h3>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-24 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border p-4">
        {/* Header hari dalam seminggu */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-xs text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid kalender */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.flat().map((day, index) => {
            const isPlaceholder = day.getTime() === 0;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const content = isPlaceholder ? [] : getContentForDay(day);
            const hasContent = content.length > 0;
            
            if (isPlaceholder) {
              return <div key={index} className="h-10 w-full" />;
            }
            
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`
                        h-10 w-full rounded-md flex flex-col items-center justify-center cursor-pointer
                        transition-all hover:ring-2 hover:ring-primary/30
                        ${!isCurrentMonth ? "opacity-40" : ""}
                        ${isToday ? "ring-2 ring-primary" : ""}
                        ${hasContent ? "hover:scale-105" : ""}
                      `}
                      style={{
                        backgroundColor: getDayColor(day),
                      }}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className={`text-xs font-medium ${hasContent ? "text-white" : "text-gray-700"}`}>
                        {format(day, "d")}
                      </span>
                      {hasContent && (
                        <div className="flex items-center space-x-0.5 mt-0.5">
                          {content.length > 0 && (
                            <span className="text-[10px] font-medium text-white">
                              {content.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {getTooltipContent(day)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
      
      {/* Legenda */}
      <div className="flex items-center text-xs gap-2 justify-end">
        <span className="text-muted-foreground">{t("less")}</span>
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: "#ebedf0" }}></div>
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: "#9be9a8" }}></div>
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: "#40c463" }}></div>
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: "#30a14e" }}></div>
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: "#216e39" }}></div>
        <span className="text-muted-foreground">{t("more")}</span>
      </div>
    </div>
  );
} 