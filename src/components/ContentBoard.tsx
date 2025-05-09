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
import { toast } from "sonner";

interface ContentBoardColumnProps {
  status: ContentStatus;
  items: ContentItem[];
  onItemClick: (id: string) => void;
  onAddItem?: () => void;
  index: number;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: ContentStatus) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: ContentItem) => void;
}

function ContentBoardColumn({ status, items = [], onItemClick, onAddItem, index, onDragOver, onDrop, onDragStart }: ContentBoardColumnProps) {
  const { t } = useLanguage();
  
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

  return (
    <div 
      className="kanban-column h-full"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className={`flex items-center justify-between p-2 border-b-2 ${statusColors[status]} mb-3 sticky top-0 bg-background z-10`}>
        <h3 className="font-medium">{t(status.toLowerCase().replace(/\s+/g, ""))}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted">{safeItems.length}</span>
      </div>
      
      <div className="space-y-3 mb-4 flex-1">
        {safeItems.map((item) => (
          <div
            key={item.id}
            id={`wrapper-${item.id}`}
            className="kanban-card transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item.id);
            }}
            draggable={true}
            onDragStart={(e) => {
              console.log(`Starting drag for item ${item.id} with status ${item.status}`);
              onDragStart(e, item);
            }}
          >
            <ContentStatusCard 
              key={item.id} 
              item={item} 
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item.id);
              }}
            />
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Status columns for the board
  const statuses: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: ContentStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;
      
      const parsedData = JSON.parse(data);
      const itemId = parsedData.itemId;
      const sourceStatus = parsedData.sourceStatus;
      
      if (sourceStatus !== targetStatus && itemId) {
        // Log untuk debugging
        console.log(`Trying to move item ${itemId} from ${sourceStatus} to ${targetStatus}`);
        
        // Temukan elemen item yang di-drag untuk animasi visual feedback
        const itemEl = document.getElementById(`item-${itemId}`);
        if (itemEl) {
          itemEl.classList.add('updating');
        }
        
        try {
          await updateContentItem(itemId, { status: targetStatus });
          setDragError(null);
          // Jika berhasil, tambahkan efek sukses
          if (itemEl) {
            itemEl.classList.remove('updating');
            itemEl.classList.add('update-success');
            setTimeout(() => {
              itemEl?.classList.remove('update-success');
            }, 1000);
          }
          
          // Tambahkan informasi untuk debugging
          console.log(`Successfully moved item ${itemId} to ${targetStatus}`);
        } catch (err) {
          console.error("Error updating item status:", err);
          setDragError(err instanceof Error ? err.message : "Gagal memperbarui status");
          
          // Jika gagal, tambahkan efek kesalahan
          if (itemEl) {
            itemEl.classList.remove('updating');
            itemEl.classList.add('update-error');
            setTimeout(() => {
              itemEl?.classList.remove('update-error');
            }, 1000);
          }
          
          // Tampilkan pesan toast untuk kesalahan
          toast.error(t("errorUpdatingStatus"));
        }
      }
    } catch (error) {
      console.error("Error in drag and drop:", error);
      setDragError("Terjadi kesalahan saat memproses drag and drop");
    } finally {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: ContentItem) => {
    setIsDragging(true);
    setDragError(null);
    
    e.dataTransfer.setData("application/json", JSON.stringify({
      itemId: item.id,
      sourceStatus: item.status
    }));
    
    e.dataTransfer.effectAllowed = "move";
    
    // Buat elemen ghost untuk drag
    const dragImg = document.createElement("div");
    dragImg.classList.add("drag-ghost");
    dragImg.textContent = item.title;
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
      
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide h-[calc(100vh-12rem)]">
        {statuses.map((status, index) => (
          <div 
            key={status}
            className={`min-w-[320px] transition-all ${isDragging ? 'drop-target' : ''}`}
          >
            <ContentBoardColumn
              status={status}
              items={getContentByStatus(status) || []}
              onItemClick={(id) => setSelectedContentId(id)}
              onAddItem={status === "Idea" ? () => setIsAddingContent(true) : undefined}
              index={index}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
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
