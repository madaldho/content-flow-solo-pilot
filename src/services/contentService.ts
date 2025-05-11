
import { supabase } from '@/integrations/supabase/client';
import { ContentItem, ContentStatus, Platform, HistoryEntry } from '@/types/content';
import { v4 as uuidv4 } from 'uuid';

// Convert Supabase response to ContentItem format
const mapDbItemToContentItem = (item: any): ContentItem => {
  // Parse JSON fields
  const parseJson = (json: any) => {
    try {
      return typeof json === 'string' ? JSON.parse(json) : json;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return json;
    }
  };

  // Handle the history array
  const history = parseJson(item.history) || [];

  // Handle platforms array - backwards compatibility
  let platforms: Platform[] = [];
  if (item.platform) {
    // Always include the main platform
    platforms = [item.platform];
  }
  
  // Handle metrics object
  const metrics = parseJson(item.metrics);

  // Handle content checklist
  const contentChecklist = parseJson(item.content_checklist) || {
    intro: false,
    mainPoints: false,
    callToAction: false,
    outro: false
  };

  // Convert from DB format to app format
  return {
    id: item.id,
    title: item.title,
    platform: item.platform, // Keep for backward compatibility
    platforms: platforms, // Add new multi-platform support
    status: item.status as ContentStatus,
    tags: item.tags || [],
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    publicationDate: item.publication_date ? new Date(item.publication_date) : undefined,
    notes: item.notes,
    referenceLink: item.reference_link,
    script: item.script,
    scriptFile: item.script_file,
    contentChecklist: contentChecklist,
    productionNotes: item.production_notes,
    equipmentUsed: item.equipment_used || [],
    contentFiles: item.content_files || [],
    metrics: metrics,
    history: history,
  };
};

// Fetch all content items
export const fetchContent = async (): Promise<ContentItem[]> => {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(mapDbItemToContentItem);
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

// Add a new content item
export const addContent = async (
  content: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist" | "history">
): Promise<string> => {
  try {
    // Prepare data for insertion
    const now = new Date().toISOString();
    const id = uuidv4();
    
    // Format publication date
    const publication_date = content.publicationDate 
      ? new Date(content.publicationDate).toISOString() 
      : null;
      
    // Create a history entry for the initial status
    const initialHistory: HistoryEntry[] = [{
      timestamp: new Date(),
      newStatus: content.status
    }];
    
    // Insert the content item
    const { error } = await supabase
      .from('content_items')
      .insert({
        id,
        title: content.title,
        platform: content.platform,
        status: content.status,
        tags: content.tags,
        publication_date,
        notes: content.notes,
        reference_link: content.referenceLink,
        script: content.script,
        script_file: content.scriptFile,
        production_notes: content.productionNotes,
        equipment_used: content.equipmentUsed,
        content_files: content.contentFiles,
        metrics: content.metrics ? JSON.stringify(content.metrics) : null,
        history: JSON.stringify(initialHistory),
        content_checklist: JSON.stringify({
          intro: false,
          mainPoints: false,
          callToAction: false,
          outro: false
        }),
        created_at: now,
        updated_at: now
      });
      
    if (error) throw error;
    
    return id;
  } catch (error) {
    console.error('Error adding content:', error);
    throw error;
  }
};

// Update an existing content item
export const updateContent = async (
  id: string, 
  updates: Partial<ContentItem>
): Promise<void> => {
  try {
    // Get the current item to compare status for history
    const { data: currentItem, error: fetchError } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Prepare data for update
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map fields from ContentItem to DB columns
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.platform !== undefined) updateData.platform = updates.platform;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.publicationDate !== undefined) {
      updateData.publication_date = updates.publicationDate 
        ? new Date(updates.publicationDate).toISOString() 
        : null;
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.referenceLink !== undefined) updateData.reference_link = updates.referenceLink;
    if (updates.script !== undefined) updateData.script = updates.script;
    if (updates.scriptFile !== undefined) updateData.script_file = updates.scriptFile;
    if (updates.contentChecklist !== undefined) {
      updateData.content_checklist = JSON.stringify(updates.contentChecklist);
    }
    if (updates.productionNotes !== undefined) updateData.production_notes = updates.productionNotes;
    if (updates.equipmentUsed !== undefined) updateData.equipment_used = updates.equipmentUsed;
    if (updates.contentFiles !== undefined) updateData.content_files = updates.contentFiles;
    if (updates.metrics !== undefined) updateData.metrics = JSON.stringify(updates.metrics);
    
    // If status has changed, update history
    if (updates.status && currentItem && updates.status !== currentItem.status) {
      // Parse existing history or initialize a new array
      const currentHistory = currentItem.history ? 
        (typeof currentItem.history === 'string' ? 
          JSON.parse(currentItem.history) : currentItem.history) : [];
      
      // Add new history entry
      const newHistory = [
        ...currentHistory,
        {
          timestamp: new Date(),
          previousStatus: currentItem.status,
          newStatus: updates.status
        }
      ];
      
      updateData.history = JSON.stringify(newHistory);
    }
    
    // Update the content item
    const { error } = await supabase
      .from('content_items')
      .update(updateData)
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Delete a content item
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Helper functions
export const getContentByStatus = (
  items: ContentItem[], 
  status: ContentStatus
): ContentItem[] => {
  return items.filter(item => item.status === status);
};

export const getContentStats = (items: ContentItem[]) => {
  // Current date for calculations
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  
  // Count by status
  const statusBreakdown: Record<ContentStatus, number> = {
    'Idea': 0,
    'Script': 0,
    'Recorded': 0,
    'Edited': 0,
    'Ready to Publish': 0,
    'Published': 0
  };
  
  // Count items
  let publishedThisWeek = 0;
  let bestPerforming = null;
  let maxViews = 0;
  
  // Process each item
  items.forEach(item => {
    // Count by status
    if (statusBreakdown[item.status] !== undefined) {
      statusBreakdown[item.status]++;
    }
    
    // Count published this week
    if (
      item.status === 'Published' && 
      item.publicationDate && 
      new Date(item.publicationDate) >= weekStart
    ) {
      publishedThisWeek++;
    }
    
    // Find best performing
    if (
      item.metrics && 
      item.metrics.views && 
      item.metrics.views > maxViews
    ) {
      maxViews = item.metrics.views;
      bestPerforming = {
        id: item.id,
        title: item.title,
        platform: item.platform,
        metrics: {
          views: item.metrics.views,
          likes: item.metrics.likes,
          comments: item.metrics.comments,
          shares: item.metrics.shares
        }
      };
    }
  });
  
  // Count unfinished
  const unfinishedCount = items.filter(
    item => item.status !== 'Published'
  ).length;
  
  return {
    totalActive: items.length,
    publishedThisWeek,
    bestPerforming,
    unfinishedCount,
    statusBreakdown
  };
};
