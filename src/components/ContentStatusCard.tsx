import { ContentItem, ContentStatus } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useContent } from "@/context/ContentContext";
import { ContentActionMenu } from "./ContentActionMenu";
import { useLanguage } from "@/context/LanguageContext";
import { History } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { HistoryTimeline } from "./HistoryTimeline";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor, getPlatformTextColor } from "@/lib/platform-utils";

interface ContentStatusCardProps {
  item: ContentItem;
  onClick: () => void;
  gradientClass?: string;
}

export function ContentStatusCard({ item, onClick, gradientClass }: ContentStatusCardProps) {
  const { updateContentItem, deleteContentItem } = useContent();
  const { t } = useLanguage();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  const statusColors: Record<ContentStatus, string> = {
    "Idea": "bg-status-idea",
    "Script": "bg-status-script",
    "Recorded": "bg-status-recorded",
    "Edited": "bg-status-edited",
    "Ready to Publish": "bg-status-ready",
    "Published": "bg-status-published"
  };

  const dateToDisplay = useMemo(() => {
    if (item.status === "Published" && item.publicationDate) {
      return format(new Date(item.publicationDate), "MMM dd, yyyy");
    }
    return format(new Date(item.updatedAt), "MMM dd, yyyy");
  }, [item]);

  // Mendapatkan platform untuk ditampilkan (platforms array atau platform lama)
  const platformsToShow = useMemo(() => {
    if (Array.isArray(item.platforms) && item.platforms.length > 0) {
      return item.platforms;
    }
    return [item.platform];
  }, [item.platforms, item.platform]);
  
  const handleMoveContent = async (newStatus: ContentStatus) => {
    console.log(`ContentStatusCard: Moving ${item.id} from ${item.status} to ${newStatus}`);
    try {
      const itemEl = document.getElementById(`item-${item.id}`);
      if (itemEl) {
        itemEl.classList.add('updating');
      }
      
      await updateContentItem(item.id, { status: newStatus });
      
      if (itemEl) {
        itemEl.classList.remove('updating');
        itemEl.classList.add('update-success');
        setTimeout(() => {
          itemEl?.classList.remove('update-success');
        }, 1000);
      }
    } catch (error) {
      console.error("Error moving content:", error);
      const itemEl = document.getElementById(`item-${item.id}`);
      if (itemEl) {
        itemEl.classList.remove('updating');
        itemEl.classList.add('update-error');
        setTimeout(() => {
          itemEl?.classList.remove('update-error');
        }, 1000);
      }
    }
  };

  const handleDeleteContent = () => {
    deleteContentItem(item.id);
  };

  const handleViewHistory = (e?: React.MouseEvent) => {
    try {
      if (e) {
        e.stopPropagation();
      }
      console.log("Opening history dialog for item:", item.id, "History:", item.history);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error("Error opening history dialog:", error);
    }
  };

  // Calculate if we should show the history icon
  const hasHistory = useMemo(() => {
    try {
      return Boolean(item.history && Array.isArray(item.history) && item.history.length > 0);
    } catch (error) {
      console.error("Error checking history:", error);
      return false;
    }
  }, [item.history]);

  return (
    <>
    <Card 
      id={`item-${item.id}`}
      className={`mb-0 hover:shadow-md transition-all duration-200 cursor-pointer relative card-hover rounded-xl overflow-hidden ${gradientClass ? 'border-0' : ''}`}
      onClick={onClick}
    >
      {gradientClass ? (
        <div className={`h-1.5 w-full ${gradientClass} opacity-70`}></div>
      ) : (
        <div className={`h-1.5 w-full ${statusColors[item.status]}`}></div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-1 font-elegant">
            {item.title}
          </CardTitle>
          <div className="flex items-center gap-2">
              {platformsToShow.length > 0 && (
                <div className="flex items-center -space-x-1" title={platformsToShow.join(", ")}>
                  {platformsToShow.slice(0, 3).map((platform, idx) => (
                    <div 
                      key={idx} 
                      className="text-lg flex items-center justify-center w-7 h-7 rounded-full" 
                      style={{
                        backgroundColor: getPlatformBgColor(platform),
                        color: getPlatformColor(platform),
                        border: `1px solid ${getPlatformColor(platform)}40`,
                        marginLeft: idx > 0 ? '2px' : '0'
                      }}
                    >
                      {getPlatformIcon(platform)}
                    </div>
                  ))}
                  {platformsToShow.length > 3 && (
                    <div 
                      className="text-sm flex items-center justify-center w-7 h-7 rounded-full ml-1"
                      style={{
                        backgroundColor: "#71809620",
                        color: "#718096"
                      }}
                    >
                      +{platformsToShow.length - 3}
                    </div>
                  )}
                </div>
              )}
            <ContentActionMenu 
              onEdit={onClick}
              onDelete={handleDeleteContent}
              onMove={handleMoveContent}
                onViewHistory={hasHistory ? handleViewHistory : undefined}
                hasHistory={hasHistory}
              currentStatus={item.status}
              className="relative z-10"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{dateToDisplay}</span>
            {hasHistory && (
                <History 
                  className="h-3.5 w-3.5 ml-1 text-primary cursor-pointer" 
                  aria-label={t("hasHistory")} 
                  onClick={handleViewHistory}
                />
            )}
          </div>
          {item.tags && item.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs rounded-full">
              {item.tags[0]}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("contentHistory")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-4 bg-muted rounded-md">
            <HistoryTimeline history={item.history || []} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
