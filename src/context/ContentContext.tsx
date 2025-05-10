
import React, { createContext, useState, useContext, useEffect } from "react";
import { ContentItem, ContentStatus, ContentTag, HistoryEntry, Platform, ContentStats } from "@/types/content";
import { toast } from "sonner";
import { getContentItems, addContentItem as addContentItemToDb, updateContentItem as updateContentItemInDb, deleteContentItem as deleteContentItemFromDb } from "@/services/contentService";
import { supabase } from "@/integrations/supabase/client";
import { useCustomOptions } from './CustomOptionsContext';

interface ContentContextType {
  contentItems: ContentItem[];
  isLoading: boolean;
  error: Error | null;
  platforms: string[];
  tags: string[];
  addCustomPlatform: (name: string) => void;
  addCustomTag: (name: string) => void;
  updateCustomPlatform: (name: string, newName: string) => void;
  updateCustomTag: (name: string, newName: string) => void;
  removeCustomPlatform: (name: string) => void;
  removeCustomTag: (name: string) => void;
  resetCustomOptions: (type: "platform" | "tag") => void;
  addContentItem: (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist" | "history">) => Promise<string>;
  updateContentItem: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  getContentStats: () => ContentStats;
  getContentByStatus: (status: ContentStatus) => ContentItem[];
  exportToCSV: () => void;
  getContentById: (id: string) => ContentItem | undefined;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORAGE_KEY = "content-flow-data";

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Get custom options from context
  const { 
    platforms, 
    tags, 
    addCustomPlatform, 
    addCustomTag, 
    updateCustomPlatform, 
    updateCustomTag, 
    removeCustomPlatform, 
    removeCustomTag, 
    resetCustomOptions 
  } = useCustomOptions();

  // Initialize with data from Supabase
  useEffect(() => {
    const loadContentItems = async () => {
      try {
        setIsLoading(true);
        const items = await getContentItems();
        setContentItems(items);
        // Save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error("Error loading content:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Try to load from localStorage as fallback
        const savedItems = localStorage.getItem(STORAGE_KEY);
        if (savedItems) {
          try {
            // Parse the dates properly
            const parsed = JSON.parse(savedItems);
            const parsedWithDates = parsed.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              publicationDate: item.publicationDate ? new Date(item.publicationDate) : undefined,
              history: item.history ? item.history.map((entry: any) => ({
                ...entry,
                timestamp: new Date(entry.timestamp)
              })) : []
            }));
            setContentItems(parsedWithDates);
            toast.warning("Using local data. Some changes may not be saved to the server.");
          } catch (parseErr) {
            console.error("Error parsing saved content:", parseErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContentItems();

    // Listen for network status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up real-time subscription for content changes
    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'content_items' 
      }, (payload) => {
        loadContentItems(); // Reload all content when any change occurs
      })
      .subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      subscription.unsubscribe();
    };
  }, []);

  // Save to localStorage when content changes
  useEffect(() => {
    if (contentItems.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contentItems));
    }
  }, [contentItems]);

  const addContentItem = async (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist" | "history">) => {
    try {
      if (!isOnline) {
        toast.error("You're offline. Please connect to the internet to add content.");
        throw new Error("Can't add content while offline");
      }

      const now = new Date();
      const newItem: Omit<ContentItem, "id" | "createdAt" | "updatedAt"> = {
        ...item,
        contentChecklist: {
          intro: false,
          mainPoints: false,
          callToAction: false,
          outro: false
        },
        history: [{
          timestamp: now,
          newStatus: item.status,
        }]
      };
      
      // Add to database
      const id = await addContentItemToDb(newItem);
      
      // Update local state with the complete item from server
      const updatedItems = await getContentItems();
      setContentItems(updatedItems);
      
      toast.success("Content idea added successfully");
      return id;
    } catch (err) {
      toast.error("Failed to add content");
      throw err;
    }
  };

  const updateContentItem = async (id: string, updates: Partial<ContentItem>): Promise<void> => {
    try {
      if (!isOnline) {
        toast.error("You're offline. Please connect to the internet to update content.");
        throw new Error("Can't update content while offline");
      }

      const existingItem = contentItems.find(item => item.id === id);
      if (!existingItem) {
        throw new Error("Content item not found");
      }

      // Add history entry if status has changed
      if (updates.status && updates.status !== existingItem.status) {
        const historyEntry: HistoryEntry = {
          timestamp: new Date(),
          previousStatus: existingItem.status,
          newStatus: updates.status,
        };

        updates.history = existingItem.history ? [...existingItem.history, historyEntry] : [historyEntry];
        
        // Log untuk debugging
        console.log(`Moving item from ${existingItem.status} to ${updates.status}`);
        console.log("History entry added:", historyEntry);
      }
      
      // Optimistic update for UI responsiveness
      const updatedLocalItem = { ...existingItem, ...updates, updatedAt: new Date() };
      const updatedItems = contentItems.map(item => 
        item.id === id ? updatedLocalItem : item
      );
      setContentItems(updatedItems);

      try {
        // Update in database
        await updateContentItemInDb(id, updates);
        
        // Update local state with the complete item from server
        const refreshedItems = await getContentItems();
        setContentItems(refreshedItems);
        
        toast.success("Content updated");
      } catch (err) {
        // Revert optimistic update if database update fails
        setContentItems(contentItems);
        console.error("Database update failed:", err);
        toast.error("Failed to update content in database");
        throw err;
      }
    } catch (err) {
      toast.error("Failed to update content");
      throw err;
    }
  };

  const deleteContentItem = async (id: string) => {
    try {
      if (!isOnline) {
        toast.error("You're offline. Please connect to the internet to delete content.");
        throw new Error("Can't delete content while offline");
      }

      // Delete from database
      await deleteContentItemFromDb(id);
      
      // Update local state
      setContentItems(prev => prev.filter(item => item.id !== id));
      
      toast.success("Content deleted");
    } catch (err) {
      toast.error("Failed to delete content");
      throw err;
    }
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
        isLoading,
        error,
        platforms,
        tags,
        addCustomPlatform,
        addCustomTag,
        updateCustomPlatform,
        updateCustomTag,
        removeCustomPlatform,
        removeCustomTag,
        resetCustomOptions,
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
