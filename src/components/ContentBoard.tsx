
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { ContentStatus, ContentItem } from "@/types/content";
import { ContentStatusCard } from "./ContentStatusCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { PlusIcon, ChevronDown, ChevronUp } from "lucide-react";

interface ContentBoardColumnProps {
  status: ContentStatus;
  items: ContentItem[];
  onItemClick: (id: string) => void;
  index: number;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: ContentStatus) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: ContentItem) => void;
  isDraggingOver: boolean;
}

function ContentBoardColumn({ 
  status, 
  items = [], 
  onItemClick, 
  index, 
  onDragOver, 
  onDrop, 
  onDragStart,
  isDraggingOver
}: ContentBoardColumnProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusColors: Record<ContentStatus, string> = {
    "Idea": "border-status-idea",
    "Script": "border-status-script",
    "Recorded": "border-status-recorded",
    "Edited": "border-status-edited",
    "Ready to Publish": "border-status-ready",
    "Published": "border-status-published"
  };

  const gradientClasses: Record<number, string> = {
    0: "card-gradient-1",
    1: "card-gradient-2",
    2: "card-gradient-3",
    3: "card-gradient-4",
    4: "card-gradient-5",
    5: "card-gradient-6"
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Reset expansion state when switching between mobile and desktop
  useEffect(() => {
    setIsExpanded(false);
  }, [isMobile]);

  return (
    <div 
      className={`kanban-column h-full rounded-lg transition-all duration-300 ${isDraggingOver ? 'ring-2 ring-primary/50 bg-primary/5 animate-drag-over' : ''}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      data-status={status}
    >
      <div 
        className={`flex items-center justify-between p-3 ${statusColors[status]} mb-0 sticky top-0 bg-background/90 backdrop-blur-sm z-10 font-medium rounded-t-lg cursor-pointer`}
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full bg-status-${status.toLowerCase().replace(/\s+/g, "")} mr-2`}></div>
          <h3 className="font-medium">{t(status.toLowerCase().replace(/\s+/g, ""))}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-muted">{safeItems.length}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      <div 
        className={`space-y-3 mb-4 flex-1 p-2 mobile-dropdown ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        {safeItems.length > 0 ? (
          <div className="numbered-list">
            {safeItems.map((item, itemIndex) => (
              <div
                key={item.id}
                id={`wrapper-${item.id}`}
                className="kanban-card numbered-item transition-all duration-200 cursor-pointer mb-3"
                onClick={() => onItemClick(item.id)}
                draggable={true}
                onDragStart={(e) => {
                  console.log(`Starting drag for item ${item.id} with status ${item.status}`);
                  e.currentTarget.classList.add('animate-drag-start');
                  onDragStart(e, item);
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove('animate-drag-start');
                }}
              >
                <ContentStatusCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => onItemClick(item.id)}
                  gradientClass={gradientClasses[itemIndex % 6]}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 text-sm text-muted-foreground rounded-lg border-2 border-dashed border-muted">
            {t("noContent")}
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentBoard() {
  const navigate = useNavigate();
  const { getContentByStatus, updateContentItem } = useContent();
  const [dragError, setDragError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingOverStatus, setDraggingOverStatus] = useState<ContentStatus | null>(null);
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  // Status columns for the board
  const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];
  
  const handleItemClick = (id: string) => {
    navigate(`/content/edit/${id}`);
  };

  const handleAddContent = () => {
    navigate('/content/new');
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: ContentStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggingOverStatus(null);
    
    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;
      
      const parsedData = JSON.parse(data);
      const itemId = parsedData.itemId;
      const sourceStatus = parsedData.sourceStatus;
      
      if (sourceStatus !== targetStatus && itemId) {
        console.log(`Moving item ${itemId} from ${sourceStatus} to ${targetStatus}`);
        
        const itemEl = document.getElementById(`item-${itemId}`);
        if (itemEl) {
          itemEl.classList.add('updating');
        }
        
        try {
          await updateContentItem(itemId, { status: targetStatus });
          setDragError(null);
          
          if (itemEl) {
            itemEl.classList.remove('updating');
            itemEl.classList.add('update-success');
            
            // Flash animation for successful move
            setTimeout(() => {
              itemEl?.classList.remove('update-success');
            }, 1000);
          }
          
          // Show success toast with history info
          toast.success(t("statusUpdated"), {
            description: `${t("movedFrom")} ${t(sourceStatus.toLowerCase().replace(/\s+/g, ""))} ${t("to")} ${t(targetStatus.toLowerCase().replace(/\s+/g, ""))}`
          });
        } catch (err) {
          console.error("Error updating item status:", err);
          setDragError(err instanceof Error ? err.message : "Error updating status");
          
          if (itemEl) {
            itemEl.classList.remove('updating');
            itemEl.classList.add('update-error');
            setTimeout(() => {
              itemEl?.classList.remove('update-error');
            }, 1000);
          }
          
          toast.error(t("errorUpdatingStatus"));
        }
      } else if (sourceStatus === targetStatus) {
        // Same column drop - no action needed
        console.log("Dropped in the same column");
      }
    } catch (error) {
      console.error("Error in drag and drop:", error);
      setDragError("Error processing drag and drop");
    } finally {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    
    // Get the column status from the data attribute
    const column = e.currentTarget;
    const status = column.getAttribute('data-status') as ContentStatus | null;
    
    if (status && draggingOverStatus !== status) {
      setDraggingOverStatus(status);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    const currentColumn = e.currentTarget;
    
    // Check if we're leaving the column and not entering a child element
    if (!relatedTarget || !currentColumn.contains(relatedTarget)) {
      setDraggingOverStatus(null);
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ContentItem) => {
    setIsDragging(true);
    setDragError(null);
    
    e.dataTransfer.setData("application/json", JSON.stringify({
      itemId: item.id,
      sourceStatus: item.status
    }));
    
    e.dataTransfer.effectAllowed = "move";
    
    // Create a custom ghost image
    const dragImg = document.createElement("div");
    dragImg.classList.add("drag-ghost", "bg-background", "p-2", "rounded", "shadow-lg", "border");
    dragImg.innerHTML = `
      <div class="text-sm font-medium">${item.title}</div>
      <div class="text-xs text-muted-foreground">${item.platforms?.[0] || item.platform}</div>
    `;
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(dragImg);
    }, 0);
  };

  return (
    <>
      {dragError && (
        <div className="bg-destructive/20 text-destructive px-4 py-2 mb-4 rounded-md">
          {dragError}
        </div>
      )}
      
      <div className="mb-4">
        <Button
          onClick={handleAddContent}
          className="rounded-xl transition-all hover:shadow-lg"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {t("addContent")}
        </Button>
      </div>
      
      <div className={`flex ${isMobile ? 'flex-col' : 'overflow-x-auto'} gap-4 pb-4 ${isMobile ? '' : 'scrollbar-hide'} h-[calc(100vh-12rem)]`}>
        {statuses.map((status, index) => (
          <div 
            key={status}
            className={`${isMobile ? 'w-full mb-3' : 'min-w-[300px]'} transition-all bg-background/70 backdrop-blur-sm p-2 rounded-lg border ${isDragging ? 'drop-target' : ''}`}
          >
            <ContentBoardColumn
              status={status}
              items={getContentByStatus(status) || []}
              onItemClick={handleItemClick}
              index={index}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              isDraggingOver={draggingOverStatus === status}
            />
          </div>
        ))}
      </div>
    </>
  );
}
