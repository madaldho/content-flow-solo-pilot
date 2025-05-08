
import { ContentItem, ContentStatus } from "@/types/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMemo } from "react";

interface ContentStatusCardProps {
  item: ContentItem;
  onClick: () => void;
}

export function ContentStatusCard({ item, onClick }: ContentStatusCardProps) {
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
      return format(item.publicationDate, "MMM dd, yyyy");
    }
    return format(item.updatedAt, "MMM dd, yyyy");
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

  return (
    <Card 
      className="mb-3 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className={`h-1 w-full rounded-t-lg ${statusColors[item.status]}`}></div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-1">
            {item.title}
          </CardTitle>
          <div className="text-lg" title={item.platform}>{platformIcon}</div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{dateToDisplay}</span>
          {item.tags && item.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {item.tags[0]}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
