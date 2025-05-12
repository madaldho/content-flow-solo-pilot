import { format } from "date-fns";
import { History } from "lucide-react";
import { ContentStatus, HistoryEntry } from "@/types/content";
import { useLanguage } from "@/context/LanguageContext";

interface HistoryTimelineProps {
  history?: HistoryEntry[];
}

export function HistoryTimeline({ history = [] }: HistoryTimelineProps) {
  const { t } = useLanguage();
  
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t("noHistory")}
      </div>
    );
  }

  // Sort history entries by timestamp, newest first
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  const getStatusColor = (status: ContentStatus): string => {
    const statusColors: Record<ContentStatus, string> = {
      "Idea": "bg-status-idea",
      "Script": "bg-status-script",
      "Recorded": "bg-status-recorded",
      "Edited": "bg-status-edited",
      "Ready to Publish": "bg-status-ready",
      "Published": "bg-status-published"
    };
    return statusColors[status] || "bg-gray-300";
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, "MMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getStatusTranslation = (status: ContentStatus | undefined): string => {
    if (!status) return "";
    
    try {
      return t(status.toLowerCase().replace(/\s+/g, ""));
    } catch (error) {
      console.error("Error translating status:", error);
      return status;
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4" />
        <h3 className="text-sm font-medium">{t("statusHistory")}</h3>
      </div>
      
      <div className="relative border-l-2 border-border pl-6 space-y-6">
        {sortedHistory.map((entry, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className={`absolute -left-8 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(entry.newStatus)}`}></div>
            
            {/* Content */}
            <div className="mb-2">
              <p className="text-sm">
                {entry.previousStatus ? (
                  <span>
                    {t("movedFrom")} <span className="font-medium">{getStatusTranslation(entry.previousStatus)}</span> {t("to")} <span className="font-medium">{getStatusTranslation(entry.newStatus)}</span>
                  </span>
                ) : (
                  <span>
                    {t("createdAs")} <span className="font-medium">{getStatusTranslation(entry.newStatus)}</span>
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(entry.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
