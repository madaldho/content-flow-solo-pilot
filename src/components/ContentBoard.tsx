
import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { ContentStatus, ContentItem } from "@/types/content";
import { ContentStatusCard } from "./ContentStatusCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContentForm } from "./ContentForm";
import { ContentDetails } from "./ContentDetails";
import { History, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContentBoardColumnProps {
  status: ContentStatus;
  items: ContentItem[];
  onItemClick: (id: string) => void;
  onAddItem?: () => void;
  index: number;
}

function ContentBoardColumn({ status, items = [], onItemClick, onAddItem, index }: ContentBoardColumnProps) {
  const { t } = useLanguage();
  const { updateContentItem } = useContent();
  
  const statusColors: Record<ContentStatus, string> = {
    "Idea": "border-status-idea",
    "Script": "border-status-script",
    "Recorded": "border-status-recorded",
    "Edited": "border-status-edited",
    "Ready to Publish": "border-status-ready",
    "Published": "border-status-published"
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  // Handle drag over events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-secondary/30');
  };

  // Handle drag leave events
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-secondary/30');
  };

  // Handle drop events
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-secondary/30');
    
    try {
      const itemId = e.dataTransfer.getData("itemId");
      const sourceStatus = e.dataTransfer.getData("sourceStatus");
      
      if (sourceStatus !== status) {
        updateContentItem(itemId, { status });
        toast.success(`Moved item to ${status}`);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      toast.error("Failed to move item");
    }
  };

  return (
    <div 
      className="kanban-column rounded-lg transition-all"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex items-center justify-between p-2 border-b-2 ${statusColors[status]} mb-3 sticky top-0 bg-background z-10`}>
        <h3 className="font-medium">{t(status.toLowerCase().replace(/\s+/g, ""))}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted">{safeItems.length}</span>
      </div>
      
      <div className="space-y-3 mb-4 flex-1">
        {safeItems.map((item) => (
          <div
            key={item.id}
            className="kanban-card transition-all duration-200 cursor-pointer"
            onClick={() => onItemClick(item.id)}
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData("itemId", item.id);
              e.dataTransfer.setData("sourceStatus", status);
              // Add a ghost drag image
              const dragImage = document.createElement('div');
              dragImage.classList.add('drag-ghost');
              dragImage.textContent = item.title;
              document.body.appendChild(dragImage);
              e.dataTransfer.setDragImage(dragImage, 0, 0);
              setTimeout(() => document.body.removeChild(dragImage), 0);
            }}
          >
            <ContentStatusCard 
              key={item.id} 
              item={item} 
              onClick={() => onItemClick(item.id)}
            />
            
            {/* Display last history entry directly on the card if available */}
            {item.history && item.history.length > 0 && (
              <div className="mt-2 text-xs flex items-center gap-1 text-muted-foreground px-2 pb-1">
                <History className="h-3 w-3" />
                <span>
                  {format(new Date(item.history[item.history.length-1].timestamp), "MMM dd, HH:mm")}
                </span>
              </div>
            )}
          </div>
        ))}
        
        {safeItems.length === 0 && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            {t("noContent")}
          </div>
        )}
      </div>
      
      {status === "Idea" && onAddItem && (
        <Button 
          variant="outline" 
          className="w-full mb-2 rounded-xl hover:bg-primary/10" 
          onClick={onAddItem}
        >
          <PlusIcon className="h-4 w-4 mr-2" /> {t("addIdea")}
        </Button>
      )}
    </div>
  );
}

export function ContentBoard() {
  const { getContentByStatus, updateContentItem } = useContent();
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { t } = useLanguage();

  // Status columns for the board
  const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];

  return (
    <>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide h-[calc(100vh-12rem)]">
        {statuses.map((status, index) => (
          <div key={status} className="min-w-[320px]">
            <ContentBoardColumn
              status={status}
              items={getContentByStatus(status) || []}
              onItemClick={(id) => setSelectedContentId(id)}
              onAddItem={status === "Idea" ? () => setIsAddingContent(true) : undefined}
              index={index}
            />
          </div>
        ))}
      </div>
      
      {/* Content Details Dialog */}
      <ContentDetails
        contentId={selectedContentId}
        onClose={() => setSelectedContentId(null)}
      />
      
      {/* Add Content Dialog */}
      {isAddingContent && (
        <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto glassmorphism">
            <DialogHeader>
              <DialogTitle>{t("addIdea")}</DialogTitle>
            </DialogHeader>
            <ContentForm 
              onClose={() => setIsAddingContent(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
