
import { ContentItem, ContentStatus } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMemo } from "react";
import { useContent } from "@/context/ContentContext";
import { ContentActionMenu } from "./ContentActionMenu";
import { useLanguage } from "@/context/LanguageContext";
import { History } from "lucide-react";

interface ContentStatusCardProps {
  item: ContentItem;
  onClick: () => void;
}

export function ContentStatusCard({ item, onClick }: ContentStatusCardProps) {
  const { updateContentItem, deleteContentItem } = useContent();
  const { t } = useLanguage();
  
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

  const platformIcon = useMemo(() => {
    switch(item.platform) {
      case "YouTube":
        return "📺";
      case "TikTok":
        return "📱";
      case "Instagram":
        return "📷";
      case "Twitter":
        return "🐦";
      case "LinkedIn":
        return "💼";
      case "Blog":
        return "📝";
      case "Podcast":
        return "🎙️";
      default:
        return "📄";
    }
  }, [item.platform]);
  
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

  // Calculate if we should show the history icon
  const hasHistory = useMemo(() => {
    return Array.isArray(item.history) && item.history.length > 1;
  }, [item.history]);

  return (
    <Card 
      id={`item-${item.id}`}
      className="mb-3 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing card-hover rounded-xl overflow-hidden"
      onClick={onClick}
    >
      <div className={`h-1.5 w-full ${statusColors[item.status]}`}></div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-1">
            {item.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-lg" title={item.platform}>{platformIcon}</div>
            <ContentActionMenu 
              onEdit={onClick}
              onDelete={handleDeleteContent}
              onMove={handleMoveContent}
              currentStatus={item.status}
              className="ml-2"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{dateToDisplay}</span>
            {hasHistory && (
              <History className="h-3.5 w-3.5 ml-1 text-primary" title={t("hasHistory")} />
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
  );
}
