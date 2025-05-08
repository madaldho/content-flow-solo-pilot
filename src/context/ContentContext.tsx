
import React, { createContext, useState, useContext, useEffect } from "react";
import { ContentItem, ContentStats, ContentStatus } from "@/types/content";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface ContentContextType {
  contentItems: ContentItem[];
  addContentItem: (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist">) => void;
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void;
  deleteContentItem: (id: string) => void;
  getContentStats: () => ContentStats;
  getContentByStatus: (status: ContentStatus) => ContentItem[];
  exportToCSV: () => void;
  getContentById: (id: string) => ContentItem | undefined;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORAGE_KEY = "content-flow-data";

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    if (savedItems) {
      try {
        // Parse the dates properly
        const parsed = JSON.parse(savedItems);
        return parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          publicationDate: item.publicationDate ? new Date(item.publicationDate) : undefined
        }));
      } catch (e) {
        console.error("Error parsing saved content:", e);
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contentItems));
  }, [contentItems]);

  const addContentItem = (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist">) => {
    const now = new Date();
    const newItem: ContentItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      contentChecklist: {
        intro: false,
        mainPoints: false,
        callToAction: false,
        outro: false
      }
    };
    
    setContentItems((prev) => [...prev, newItem]);
    toast.success("Content idea added successfully");
    return newItem.id;
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems((prev) => 
      prev.map((item) => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() } 
          : item
      )
    );
    toast.success("Content updated");
  };

  const deleteContentItem = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Content deleted");
  };

  const getContentByStatus = (status: ContentStatus): ContentItem[] => {
    return contentItems.filter((item) => item.status === status);
  };

  const getContentById = (id: string): ContentItem | undefined => {
    return contentItems.find(item => item.id === id);
  };

  const getContentStats = (): ContentStats => {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Count items published in the last week
    const publishedThisWeek = contentItems.filter(
      (item) => 
        item.status === "Published" && 
        item.publicationDate && 
        item.publicationDate >= oneWeekAgo
    ).length;

    // Count active items (not published)
    const totalActive = contentItems.filter(
      (item) => item.status !== "Published"
    ).length;

    // Count unfinished content
    const unfinishedCount = contentItems.filter(
      (item) => item.status !== "Published" && item.status !== "Ready to Publish"
    ).length;

    // Calculate status breakdown
    const statusBreakdown = contentItems.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = 0;
      }
      acc[item.status]++;
      return acc;
    }, {} as Record<ContentStatus, number>);

    // Find best performing content based on views
    const publishedContent = contentItems.filter(
      (item) => item.status === "Published" && item.metrics?.views
    );
    
    const bestPerforming = publishedContent.length > 0 
      ? publishedContent.reduce((best, current) => {
          return (current.metrics?.views || 0) > (best.metrics?.views || 0) ? current : best;
        }, publishedContent[0])
      : undefined;

    return {
      totalActive,
      publishedThisWeek,
      bestPerforming: bestPerforming ? {
        id: bestPerforming.id,
        title: bestPerforming.title,
        platform: bestPerforming.platform,
        metrics: bestPerforming.metrics || {}
      } : undefined,
      unfinishedCount,
      statusBreakdown: statusBreakdown as Record<ContentStatus, number>
    };
  };

  // Export data to CSV
  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Title", "Platform", "Status", "Created", "Updated", "Publication Date", "Tags"];
      const csvContent = [
        headers.join(","),
        ...contentItems.map(item => [
          `"${item.title.replace(/"/g, '""')}"`,
          item.platform,
          item.status,
          item.createdAt.toLocaleDateString(),
          item.updatedAt.toLocaleDateString(),
          item.publicationDate ? item.publicationDate.toLocaleDateString() : "",
          `"${item.tags.join(", ")}"`
        ].join(","))
      ].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `content_export_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`);
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Export successful");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    }
  };

  return (
    <ContentContext.Provider
      value={{
        contentItems,
        addContentItem,
        updateContentItem,
        deleteContentItem,
        getContentStats,
        getContentByStatus,
        exportToCSV,
        getContentById
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
