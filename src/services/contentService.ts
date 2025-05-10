
import { ContentItem, ContentStatus, ContentTag, Platform, ContentStats, HistoryEntry } from "@/types/content";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

// Simulate local storage for content items when not using a database
let contentItems: ContentItem[] = [];

// Default platforms and tags
const DEFAULT_PLATFORMS: Platform[] = ["YouTube", "TikTok", "Instagram", "Twitter", "LinkedIn", "Blog", "Podcast"];
const DEFAULT_TAGS: ContentTag[] = ["Education", "Entertainment", "Promotion", "Tutorial", "Review", "Vlog", "Interview", "Announcement"];

// Custom platforms and tags
let customPlatforms: Platform[] = [];
let customTags: ContentTag[] = [];

// Check if data exists in local storage
const initializeData = () => {
  if (typeof window !== 'undefined') {
    const storedItems = localStorage.getItem('contentItems');
    if (storedItems) {
      contentItems = JSON.parse(storedItems);
      
      // Ensure dates are properly parsed
      contentItems.forEach(item => {
        item.createdAt = new Date(item.createdAt);
        item.updatedAt = new Date(item.updatedAt);
        if (item.publicationDate) {
          item.publicationDate = new Date(item.publicationDate);
        }
        if (item.history) {
          item.history.forEach(entry => {
            entry.timestamp = new Date(entry.timestamp);
          });
        }
      });
    }
    
    // Load custom platforms and tags
    const storedPlatforms = localStorage.getItem('customPlatforms');
    if (storedPlatforms) {
      customPlatforms = JSON.parse(storedPlatforms);
    }
    
    const storedTags = localStorage.getItem('customTags');
    if (storedTags) {
      customTags = JSON.parse(storedTags);
    }
  }
};

// Call initialization
initializeData();

// Save data to local storage
const saveData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('contentItems', JSON.stringify(contentItems));
    localStorage.setItem('customPlatforms', JSON.stringify(customPlatforms));
    localStorage.setItem('customTags', JSON.stringify(customTags));
  }
};

// Content Service functions
export const addContentItem = async (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist" | "history">): Promise<string> => {
  const now = new Date();
  const newId = uuidv4();
  
  const newItem: ContentItem = {
    id: newId,
    ...item,
    createdAt: now,
    updatedAt: now,
    contentChecklist: {
      intro: false,
      mainPoints: false,
      callToAction: false,
      outro: false
    },
    history: [{
      timestamp: now,
      newStatus: item.status
    }]
  };
  
  // Add to database if available, otherwise use local storage
  try {
    if (supabase) {
      // Convert history to JSON format for database storage
      const dbItem = {
        ...newItem,
        created_at: newItem.createdAt.toISOString(),
        updated_at: newItem.updatedAt.toISOString(),
        publication_date: newItem.publicationDate ? newItem.publicationDate.toISOString() : null,
        history: JSON.stringify(newItem.history), // Convert history array to JSON string
        platforms: newItem.platforms
      };
      
      const { data, error } = await supabase
        .from('content_items')
        .insert(dbItem);
      
      if (error) {
        console.error('Error adding content to database:', error);
        throw error;
      }
    } else {
      // Fall back to local storage
      contentItems.push(newItem);
      saveData();
    }
    
    return newId;
  } catch (error) {
    console.error('Error adding content item:', error);
    throw error;
  }
};

export const updateContentItem = async (id: string, updates: Partial<ContentItem>): Promise<void> => {
  const now = new Date();
  
  try {
    if (supabase) {
      // Fetch the existing item from the database
      const { data: existingItem, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching content item from database:', fetchError);
        throw fetchError;
      }
      
      if (!existingItem) {
        throw new Error(`Content item with id ${id} not found in database`);
      }
      
      // Parse the history from JSON if it exists
      let history: HistoryEntry[] = [];
      if (existingItem.history) {
        try {
          if (typeof existingItem.history === 'string') {
            history = JSON.parse(existingItem.history);
          } else if (Array.isArray(existingItem.history)) {
            history = existingItem.history;
          }
          
          // Ensure the parsed history entries have Date objects for timestamps
          history.forEach(entry => {
            entry.timestamp = new Date(entry.timestamp);
          });
        } catch (parseError) {
          console.error('Error parsing history from JSON:', parseError);
          history = []; // Initialize to an empty array to avoid further errors
        }
      }
      
      // Add a history entry if the status is being updated
      if (updates.status && updates.status !== existingItem.status) {
        history.push({
          timestamp: now,
          previousStatus: existingItem.status as ContentStatus,
          newStatus: updates.status
        });
      }
      
      // Convert updates to database format
      const dbUpdates = {
        ...updates,
        updated_at: now.toISOString(),
        publication_date: updates.publicationDate ? updates.publicationDate.toISOString() : null,
        history: JSON.stringify(history) // Convert history array to JSON string
      };
      
      const { error: updateError } = await supabase
        .from('content_items')
        .update(dbUpdates)
        .eq('id', id);
      
      if (updateError) {
        console.error('Error updating content in database:', updateError);
        throw updateError;
      }
    } else {
      // Fall back to local storage
      const index = contentItems.findIndex(item => item.id === id);
      if (index !== -1) {
        const updatedItem: ContentItem = {
          ...contentItems[index],
          ...updates,
          updatedAt: now,
          history: contentItems[index].history ? [...contentItems[index].history, {
            timestamp: now,
            previousStatus: contentItems[index].status,
            newStatus: updates.status || contentItems[index].status
          }] : [{
            timestamp: now,
            newStatus: updates.status || contentItems[index].status
          }]
        };
        contentItems[index] = updatedItem;
        saveData();
      } else {
        throw new Error(`Content item with id ${id} not found`);
      }
    }
  } catch (error) {
    console.error('Error updating content item:', error);
    throw error;
  }
};

export const deleteContentItem = async (id: string): Promise<void> => {
  try {
    if (supabase) {
      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting content from database:', error);
        throw error;
      }
    } else {
      // Fall back to local storage
      contentItems = contentItems.filter(item => item.id !== id);
      saveData();
    }
  } catch (error) {
    console.error('Error deleting content item:', error);
    throw error;
  }
};

export const getContentItems = async (): Promise<ContentItem[]> => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('content_items')
        .select('*');
      
      if (error) {
        console.error('Error fetching content from database:', error);
        throw error;
      }
      
      // Parse the history from JSON if it exists
      const parsedData = data.map(item => {
        let parsedHistory: HistoryEntry[] = [];
        if (item.history) {
          try {
            if (typeof item.history === 'string') {
              parsedHistory = JSON.parse(item.history);
            } else if (Array.isArray(item.history)) {
              parsedHistory = item.history;
            }
            // Ensure dates are properly parsed
            parsedHistory = parsedHistory.map((entry: any) => ({
              ...entry,
              timestamp: new Date(entry.timestamp)
            }));
          } catch (error) {
            console.error('Error parsing history', error);
            parsedHistory = [];
          }
        }
        
        return {
          id: item.id,
          title: item.title,
          platform: item.platform,
          platforms: item.platforms || [item.platform], // Add multi-platform support
          status: item.status as ContentStatus,
          tags: item.tags || [],
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          publicationDate: item.publication_date ? new Date(item.publication_date) : undefined,
          notes: item.notes,
          referenceLink: item.reference_link,
          script: item.script,
          scriptFile: item.script_file,
          contentChecklist: item.content_checklist || {
            intro: false,
            mainPoints: false,
            callToAction: false,
            outro: false
          },
          productionNotes: item.production_notes,
          equipmentUsed: item.equipment_used || [],
          contentFiles: item.content_files || [],
          metrics: item.metrics,
          history: parsedHistory
        } as ContentItem;
      });
      
      return parsedData;
    } else {
      // Fall back to local storage
      return contentItems;
    }
  } catch (error) {
    console.error('Error getting content items:', error);
    throw error;
  }
};

export const getContentStats = (): ContentStats => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const publishedThisWeek = contentItems.filter(item =>
    item.status === "Published" && item.publicationDate && item.publicationDate >= oneWeekAgo
  ).length;
  
  const bestPerforming = contentItems
    .filter(item => item.status === "Published" && item.metrics && item.metrics.views)
    .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))[0];
  
  const unfinishedCount = contentItems.filter(item => item.status !== "Published").length;
  
  const statusBreakdown: Record<ContentStatus, number> = {
    "Idea": contentItems.filter(item => item.status === "Idea").length,
    "Script": contentItems.filter(item => item.status === "Script").length,
    "Recorded": contentItems.filter(item => item.status === "Recorded").length,
    "Edited": contentItems.filter(item => item.status === "Edited").length,
    "Ready to Publish": contentItems.filter(item => item.status === "Ready to Publish").length,
    "Published": contentItems.filter(item => item.status === "Published").length
  };
  
  return {
    totalActive: contentItems.filter(item => item.status !== "Published").length,
    publishedThisWeek,
    bestPerforming: bestPerforming ? {
      id: bestPerforming.id,
      title: bestPerforming.title,
      platform: bestPerforming.platform,
      metrics: bestPerforming.metrics || {}
    } : undefined,
    unfinishedCount,
    statusBreakdown
  };
};

export const getContentByStatus = (status: ContentStatus): ContentItem[] => {
  return contentItems.filter(item => item.status === status);
};

export const exportToCSV = (): void => {
  if (typeof window !== 'undefined') {
    const csvRows = [];
    const headers = Object.keys(contentItems[0] || {}).join(',');
    csvRows.push(headers);
    
    for (const item of contentItems) {
      const values = Object.values(item).map(value => {
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
      csvRows.push(values);
    }
    
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'content_items.csv');
    a.click();
  }
};

export const getContentById = (id: string): ContentItem | undefined => {
  return contentItems.find(item => item.id === id);
};

export const getPlatforms = (): Platform[] => {
  return [...DEFAULT_PLATFORMS, ...customPlatforms];
};

export const getTags = (): ContentTag[] => {
  return [...DEFAULT_TAGS, ...customTags];
};

export const addCustomPlatform = (platform: Platform): void => {
  if (!customPlatforms.includes(platform)) {
    customPlatforms.push(platform);
    saveData();
  }
};

export const addCustomTag = (tag: ContentTag): void => {
  if (!customTags.includes(tag)) {
    customTags.push(tag);
    saveData();
  }
};

export const updateCustomPlatform = (oldPlatform: Platform, newPlatform: Platform): void => {
  const index = customPlatforms.indexOf(oldPlatform);
  if (index !== -1) {
    customPlatforms[index] = newPlatform;
    saveData();
  }
};

export const updateCustomTag = (oldTag: ContentTag, newTag: ContentTag): void => {
  const index = customTags.indexOf(oldTag);
  if (index !== -1) {
    customTags[index] = newTag;
    saveData();
  }
};

export const removeCustomPlatform = (platform: Platform): void => {
  customPlatforms = customPlatforms.filter(p => p !== platform);
  saveData();
};

export const removeCustomTag = (tag: ContentTag): void => {
  customTags = customTags.filter(t => t !== tag);
  saveData();
};

export const resetCustomOptions = (type: "platform" | "tag"): void => {
  if (type === "platform") {
    customPlatforms = [];
  } else {
    customTags = [];
  }
  saveData();
};
