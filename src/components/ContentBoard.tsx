
import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { ContentStatus, ContentItem } from "@/types/content";
import { ContentStatusCard } from "./ContentStatusCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContentForm } from "./ContentForm";
import { ContentDetails } from "./ContentDetails";
import { PlusIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ContentBoardColumnProps {
  status: ContentStatus;
  items: ContentItem[];
  onItemClick: (id: string) => void;
  onAddItem?: () => void;
  index: number;
}

function ContentBoardColumn({ status, items, onItemClick, onAddItem, index }: ContentBoardColumnProps) {
  const { t } = useLanguage();
  
  const statusColors: Record<ContentStatus, string> = {
    "Idea": "border-status-idea",
    "Script": "border-status-script",
    "Recorded": "border-status-recorded",
    "Edited": "border-status-edited",
    "Ready to Publish": "border-status-ready",
    "Published": "border-status-published"
  };

  return (
    <Droppable droppableId={status} type="CONTENT">
      {(provided, snapshot) => (
        <div 
          className={`kanban-column ${snapshot.isDraggingOver ? "bg-secondary/50" : ""}`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <div className={`flex items-center justify-between p-2 border-b-2 ${statusColors[status]} mb-3 sticky top-0 bg-background z-10`}>
            <h3 className="font-medium">{t(status.toLowerCase().replace(/\s+/g, ""))}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-muted">{items.length}</span>
          </div>
          
          <div className="space-y-3 mb-4 flex-1">
            {items.map((item, idx) => (
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`kanban-card ${snapshot.isDragging ? "kanban-card-ghost" : ""}`}
                  >
                    <ContentStatusCard 
                      key={item.id} 
                      item={item} 
                      onClick={() => onItemClick(item.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            
            {provided.placeholder}
            
            {items.length === 0 && (
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
      )}
    </Droppable>
  );
}

export function ContentBoard() {
  const { getContentByStatus, updateContentItem } = useContent();
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const { t } = useLanguage();

  // Status columns for the board
  const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Get the content item that was moved
    const item = getContentByStatus(source.droppableId as ContentStatus).find(
      item => item.id === draggableId
    );
    
    if (item) {
      // If the status has changed, update it
      if (destination.droppableId !== source.droppableId) {
        updateContentItem(item.id, {
          status: destination.droppableId as ContentStatus
        });
      }
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide h-[calc(100vh-12rem)]">
          {statuses.map((status, index) => (
            <ContentBoardColumn
              key={status}
              status={status}
              items={getContentByStatus(status)}
              onItemClick={(id) => setSelectedContentId(id)}
              onAddItem={status === "Idea" ? () => setIsAddingContent(true) : undefined}
              index={index}
            />
          ))}
        </div>
      </DragDropContext>
      
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
