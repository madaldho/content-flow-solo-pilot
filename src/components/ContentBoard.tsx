
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentItem, ContentStatus } from "@/types/content";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ContentForm } from './ContentForm';
import { useLanguage } from "@/context/LanguageContext";

const columnTitles: { [key in ContentStatus]: string } = {
  "Idea": "ideaColumnTitle",
  "Script": "scriptColumnTitle",
  "Recorded": "recordedColumnTitle",
  "Edited": "editedColumnTitle",
  "Ready to Publish": "readyToPublishColumnTitle",
  "Published": "publishedColumnTitle",
};

export function ContentBoard() {
  const { contentItems, updateContentItem, getContentByStatus } = useContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const { t } = useLanguage();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const getList = (status: ContentStatus) => getContentByStatus(status);

  const handleOnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (destination.droppableId === source.droppableId) {
      // Reordering within the same column (optional, can be implemented if needed)
      return;
    }

    const itemId = draggableId;
    const newStatus = destination.droppableId as ContentStatus;

    try {
      await updateContentItem(itemId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update content item:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("contentBoard")}</h2>
        <Button onClick={openModal} className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg">
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("addContent")}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.keys(columnTitles).map((statusKey) => {
            const status = statusKey as ContentStatus;
            return (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <Card
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="rounded-lg shadow-md"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">{t(columnTitles[status])}</CardTitle>
                      <CardDescription>{t(`${status.toLowerCase().replace(/ /g, "")}Description`)}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      {getList(status).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-muted/50 p-3 mb-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-move"
                              onClick={() => handleEdit(item)}
                            >
                              <div className="font-medium line-clamp-1">{item.title}</div>
                              <div className="flex items-center gap-1 mt-1">
                                {item.platforms && item.platforms.map((platform: string) => (
                                  <Badge key={platform} variant="secondary" className="mr-1">{platform}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CardContent>
                  </Card>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal for adding/editing content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <ContentForm
              initialData={selectedItem || undefined}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
