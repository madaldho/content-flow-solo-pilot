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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { ContentActionMenu } from "@/components/ContentActionMenu";
import { getPlatformIcon, getPlatformColor, getPlatformBgColor, getPlatformTextColor } from "@/lib/platform-utils";

interface ContentBoardColumnProps {
  status: ContentStatus;
  items: ContentItem[];
  onItemClick: (id: string) => void;
  index: number;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: ContentStatus) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: ContentItem) => void;
  isDraggingOver: boolean;
  onDeleteItem: (id: string) => void;
  onMoveItem: (id: string, newStatus: ContentStatus) => void;
  onViewHistory: (item: ContentItem) => void;
  hasHistoryFn: (item: ContentItem) => boolean;
}

function ContentBoardColumn({ 
  status, 
  items = [], 
  onItemClick, 
  index, 
  onDragOver, 
  onDrop, 
  onDragStart,
  isDraggingOver,
  onDeleteItem,
  onMoveItem,
  onViewHistory,
  hasHistoryFn
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
    if (isMobile) {
      // On mobile, only expand the first column by default
      setIsExpanded(index === 0);
    } else {
      // On desktop, expand all columns
      setIsExpanded(true);
    }
  }, [isMobile, index]);

  return (
    <div 
      className={`kanban-column rounded-lg transition-all duration-300 ${isDraggingOver ? 'ring-2 ring-primary/50 bg-primary/5 animate-drag-over' : ''}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      data-status={status}
    >
      <div 
        className={`flex items-center justify-between p-3 ${statusColors[status]} sticky top-0 bg-background/90 backdrop-blur-sm z-10 font-medium rounded-t-lg cursor-pointer`}
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
        className={`space-y-2 flex-1 p-2 transition-all duration-300 ease-in-out overflow-hidden ${isMobile ? (isExpanded ? 'max-h-[800px]' : 'max-h-0') : ''}`}
      >
        {safeItems.length > 0 ? (
          <div className="space-y-2">
            {safeItems.map((item, itemIndex) => (
              <div
                key={item.id}
                id={`wrapper-${item.id}`}
                className="kanban-card transition-all duration-200 cursor-pointer rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/5"
                onClick={() => onItemClick(item.id)}
                draggable={true}
                onDragStart={(e) => {
                  e.currentTarget.classList.add('animate-drag-start');
                  onDragStart(e, item);
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove('animate-drag-start');
                }}
              >
                <div className="p-2">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full mr-2">
                      {itemIndex + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.isArray(item.platforms) && item.platforms.length > 0 ? (
                        <div className="flex gap-1 text-xs font-medium">
                          <span 
                            className="px-2 py-1 rounded-full flex items-center gap-1"
                            style={{
                              backgroundColor: getPlatformBgColor(item.platforms[0]),
                              color: getPlatformColor(item.platforms[0]),
                              border: `1px solid ${getPlatformColor(item.platforms[0])}30`
                            }}
                          >
                            <span className="text-sm">{getPlatformIcon(item.platforms[0])}</span>
                            {item.platforms[0]}
                          </span>
                          {item.platforms.length > 1 && (
                            <span 
                              className="w-6 h-6 flex items-center justify-center rounded-full" 
                              title={item.platforms.slice(1).join(", ")}
                              style={{
                                backgroundColor: "#71809620",
                                color: "#718096"
                              }}
                            >
                              +{item.platforms.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: getPlatformBgColor(item.platform),
                            color: getPlatformColor(item.platform),
                            border: `1px solid ${getPlatformColor(item.platform)}30`
                          }}
                        >
                          <span className="text-sm">{getPlatformIcon(item.platform)}</span>
                      {item.platform}
                    </span>
                      )}
                      <ContentActionMenu 
                        onEdit={() => handleEditContent(item.id)}
                        onDelete={() => onDeleteItem(item.id)}
                        onMove={(newStatus) => onMoveItem(item.id, newStatus)}
                        onViewHistory={hasHistoryFn(item) ? () => onViewHistory(item) : undefined}
                        hasHistory={hasHistoryFn(item)}
                        currentStatus={item.status}
                        className="h-6 w-6"
                      />
                    </div>
                  </div>
                  <h4 className="font-medium line-clamp-2 mt-1">{item.title}</h4>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs px-1.5 py-0.5 bg-secondary/50 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="text-xs px-1.5 py-0.5 bg-secondary/50 rounded-md">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-sm text-muted-foreground rounded-lg border-2 border-dashed border-muted">
            {t("noContent")}
          </div>
        )}
      </div>
    </div>
  );
}

export function ContentBoard() {
  const navigate = useNavigate();
  const { getContentByStatus, updateContentItem, deleteContentItem } = useContent();
  const [dragError, setDragError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingOverStatus, setDraggingOverStatus] = useState<ContentStatus | null>(null);
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Status columns for the board
  const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];
  
  // Fungsi untuk menampilkan preview, bukan langsung ke edit
  const handleItemClick = (id: string) => {
    navigate(`/content/detail/${id}`);
  };

  // Fungsi untuk mengedit konten (digunakan di action menu)
  const handleEditContent = (id: string) => {
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

  // Function to check if an item has history entries
  const hasHistory = (item: ContentItem) => {
    try {
      console.log("Checking history for item:", item.id, "History:", item.history);
      return Boolean(item.history && Array.isArray(item.history) && item.history.length > 0);
    } catch (error) {
      console.error("Error checking history:", error);
      return false;
    }
  };

  // Handle moving content item to another status
  const handleMoveContent = async (itemId: string, newStatus: ContentStatus) => {
    try {
      const itemEl = document.getElementById(`wrapper-${itemId}`);
      if (itemEl) {
        itemEl.classList.add('updating');
      }
      
      await updateContentItem(itemId, { status: newStatus });
      
      if (itemEl) {
        itemEl.classList.remove('updating');
        itemEl.classList.add('update-success');
        setTimeout(() => {
          itemEl?.classList.remove('update-success');
        }, 1000);
      }
      
      toast.success(t("statusUpdated"));
    } catch (error) {
      console.error("Error moving content:", error);
      const itemEl = document.getElementById(`wrapper-${itemId}`);
      if (itemEl) {
        itemEl.classList.remove('updating');
        itemEl.classList.add('update-error');
        setTimeout(() => {
          itemEl?.classList.remove('update-error');
        }, 1000);
      }
      
      toast.error(t("errorUpdatingStatus"));
    }
  };

  // Handle viewing history
  const handleViewHistory = (item: ContentItem) => {
    try {
      console.log("Opening history dialog for item:", item.id, "History:", item.history);
      setSelectedItem(item);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error("Error opening history dialog:", error);
      toast.error(t("errorViewingHistory"));
    }
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
      
      <div className={`${isMobile ? 'flex flex-col space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'} pb-4`}>
        {statuses.map((status, index) => {
          const itemsInStatus = getContentByStatus(status);
          return (
          <div 
            key={status}
            className={`transition-all bg-background/70 backdrop-blur-sm rounded-lg border ${isDragging ? 'drop-target' : ''}`}
          >
            <ContentBoardColumn
              status={status}
              items={itemsInStatus}
              onItemClick={handleItemClick}
              index={index}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              isDraggingOver={draggingOverStatus === status}
              onDeleteItem={deleteContentItem}
              onMoveItem={handleMoveContent}
              onViewHistory={handleViewHistory}
              hasHistoryFn={hasHistory}
            />
          </div>
          );
        })}
      </div>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title || t("contentHistory")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-4 bg-muted rounded-md">
            <HistoryTimeline history={selectedItem?.history || []} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
