import React, { useState, useEffect, useCallback } from "react";
import { ContentItem, ContentStatus } from "@/types/content";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast } from "sonner";
import { Edit, CheckCircle, GripVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlatformBgColor, getPlatformTextColor } from "@/lib/platform-utils";

const columnOrder: ContentStatus[] = ["Idea", "Script", "Recorded", "Edited", "Ready to Publish", "Published"];

export function ContentBoard() {
  const { contentItems, updateContentItemStatus, getContentStats } = useContent();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (contentItems && contentItems.length > 0) {
      const calculatedStats = getContentStats();
      setStats(calculatedStats);
    }
  }, [contentItems, getContentStats]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ContentStatus;
    const contentId = draggableId;

    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError(false);

    try {
      await updateContentItemStatus(contentId, newStatus);
      toast.success(t("statusUpdated"));
      setUpdateSuccess(true);
    } catch (error) {
      console.error("Failed to update content status:", error);
      toast.error(t("statusUpdateFailed"));
      setUpdateError(true);
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError(false);
      }, 2000);
    }
  }, [updateContentItemStatus, t]);

  const getColumnTitle = (status: ContentStatus) => {
    return t(status.toLowerCase().replace(/ /g, ""));
  };

  const getStatusColor = (status: ContentStatus) => {
    const statusColors: Record<ContentStatus, string> = {
      'Idea': 'status-idea',
      'Script': 'status-script',
      'Recorded': 'status-recorded',
      'Edited': 'status-edited',
      'Ready to Publish': 'status-ready',
      'Published': 'status-published'
    };
    return statusColors[status] || 'status-published';
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {columnOrder.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`kanban-column ${snapshot.isDraggingOver ? 'drop-target' : ''}`}
              >
                <h2 className="text-lg font-semibold mb-3 px-3 py-2 rounded-md bg-secondary/20 border-b">
                  {getColumnTitle(status)} ({stats?.statusBreakdown[status] || 0})
                </h2>
                {contentItems
                  .filter((item) => item.status === status)
                  .map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`kanban-card p-4 mb-3 rounded-md shadow-sm bg-card text-card-foreground border ${isUpdating ? 'updating' : ''} ${updateSuccess ? 'update-success' : ''} ${updateError ? 'update-error' : ''} card-hover`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-md font-medium line-clamp-1">{item.title}</h3>
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <Badge className="gap-1.5" style={{ backgroundColor: getPlatformBgColor(item.platform), color: getPlatformTextColor(item.platform) }}>
                              {item.platform}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {item.status === "Published" ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                                {t(item.status.toLowerCase().replace(/ /g, ""))}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
