
import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { ContentStatus, ContentItem } from "@/types/content";
import { ContentStatusCard } from "./ContentStatusCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContentForm } from "./ContentForm";
import { ContentDetails } from "./ContentDetails";
import { PlusIcon } from "lucide-react";

interface ContentBoardColumnProps {
  status: ContentStatus;
  items: ContentItem[];
  onItemClick: (id: string) => void;
  onAddItem?: () => void;
}

function ContentBoardColumn({ status, items, onItemClick, onAddItem }: ContentBoardColumnProps) {
  const statusColors: Record<ContentStatus, string> = {
    "Idea": "border-status-idea",
    "Script": "border-status-script",
    "Recorded": "border-status-recorded",
    "Edited": "border-status-edited",
    "Ready to Publish": "border-status-ready",
    "Published": "border-status-published"
  };

  return (
    <div className="flex flex-col min-w-[280px] md:w-full">
      <div className={`flex items-center justify-between p-2 border-b-2 ${statusColors[status]} mb-3 sticky top-0 bg-background z-10`}>
        <h3 className="font-medium">{status}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted">{items.length}</span>
      </div>
      
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <ContentStatusCard 
            key={item.id} 
            item={item} 
            onClick={() => onItemClick(item.id)}
          />
        ))}
        
        {items.length === 0 && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No content in this status
          </div>
        )}
      </div>
      
      {status === "Idea" && onAddItem && (
        <Button 
          variant="outline" 
          className="w-full mb-2" 
          onClick={onAddItem}
        >
          <PlusIcon className="h-4 w-4 mr-2" /> Add Idea
        </Button>
      )}
    </div>
  );
}

export function ContentBoard() {
  const { getContentByStatus } = useContent();
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);

  // Status columns for the board
  const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];

  return (
    <>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {statuses.map((status) => (
          <ContentBoardColumn
            key={status}
            status={status}
            items={getContentByStatus(status)}
            onItemClick={(id) => setSelectedContentId(id)}
            onAddItem={status === "Idea" ? () => setIsAddingContent(true) : undefined}
          />
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
          <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Content Idea</DialogTitle>
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
