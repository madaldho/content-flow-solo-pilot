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
  
  // Periksa apakah ada platforms di field JSON metrics
  const metrics = parseJson(item.metrics);
  if (metrics?.platforms && Array.isArray(metrics.platforms)) {
    platforms = metrics.platforms.map((p: any) => p.name || "");
  } else if (item.platform) {
    // Jika tidak ada platforms di metrics, gunakan platform
    platforms = [item.platform];
  }
  
  // Parse platform links
  const platformLinks = parseJson(item.platform_links) || {};

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
    contentLink: item.content_link,
    platformLinks: platformLinks,
    isEndorsement: item.is_endorsement || false,
    isCollaboration: item.is_collaboration || false,
    endorsementName: item.endorsement_name || '',
    collaborationName: item.collaboration_name || '',
    endorsementPrice: item.endorsement_price || '',
    script: item.script,
    scriptFile: item.script_file,
    contentChecklist: parseJson(item.content_checklist) || {
      intro: false,
      mainPoints: false,
      callToAction: false,
      outro: false
    },
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
    
    // Siapkan metrics dengan platforms
    const platforms = Array.isArray(content.platforms) && content.platforms.length > 0
      ? content.platforms
      : [content.platform];
      
    const initialMetrics = content.metrics || {};
    
    // Buat atau perbarui platforms dalam metrics
    const metricsWithPlatforms = {
      ...initialMetrics,
      platforms: platforms.map(platform => ({
        name: platform,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saved: 0,
        engagement_rate: 0
      }))
    };
    
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
        content_link: content.contentLink,
        platform_links: content.platformLinks ? JSON.stringify(content.platformLinks) : null,
        is_endorsement: content.isEndorsement || false,
        is_collaboration: content.isCollaboration || false,
        endorsement_name: content.endorsementName || '',
        collaboration_name: content.collaborationName || '',
        endorsement_price: content.endorsementPrice || '',
        script: content.script,
        script_file: content.scriptFile,
        production_notes: content.productionNotes,
        equipment_used: content.equipmentUsed,
        content_files: content.contentFiles,
        metrics: JSON.stringify(metricsWithPlatforms),
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
    
    // Perbarui platform dengan platform pertama dari platforms jika tersedia
    if (updates.platforms && Array.isArray(updates.platforms) && updates.platforms.length > 0) {
      updateData.platform = updates.platforms[0];
    } else if (updates.platform !== undefined) {
      updateData.platform = updates.platform;
    }
    
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.publicationDate !== undefined) {
      updateData.publication_date = updates.publicationDate 
        ? new Date(updates.publicationDate).toISOString() 
        : null;
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.referenceLink !== undefined) updateData.reference_link = updates.referenceLink;
    if (updates.contentLink !== undefined) updateData.content_link = updates.contentLink;
    if (updates.platformLinks !== undefined) updateData.platform_links = JSON.stringify(updates.platformLinks);
    if (updates.isEndorsement !== undefined) updateData.is_endorsement = updates.isEndorsement;
    if (updates.isCollaboration !== undefined) updateData.is_collaboration = updates.isCollaboration;
    if (updates.endorsementName !== undefined) updateData.endorsement_name = updates.endorsementName;
    if (updates.collaborationName !== undefined) updateData.collaboration_name = updates.collaborationName;
    if (updates.endorsementPrice !== undefined) updateData.endorsement_price = updates.endorsementPrice;
    if (updates.script !== undefined) updateData.script = updates.script;
    if (updates.scriptFile !== undefined) updateData.script_file = updates.scriptFile;
    if (updates.contentChecklist !== undefined) {
      updateData.content_checklist = JSON.stringify(updates.contentChecklist);
    }
    if (updates.productionNotes !== undefined) updateData.production_notes = updates.productionNotes;
    if (updates.equipmentUsed !== undefined) updateData.equipment_used = updates.equipmentUsed;
    if (updates.contentFiles !== undefined) updateData.content_files = updates.contentFiles;
    
    // Perbarui metrics
    if (updates.metrics !== undefined || updates.platforms !== undefined) {
      // Parse existing metrics
      const currentMetrics = currentItem.metrics 
        ? (typeof currentItem.metrics === 'string' 
          ? JSON.parse(currentItem.metrics) 
          : currentItem.metrics) 
        : {};
      
      // Perbarui platforms dalam metrics jika platforms diupdate
      if (updates.platforms && Array.isArray(updates.platforms)) {
        // Dapatkan platform-platform yang sudah ada di metrics
        const existingPlatforms = Array.isArray(currentMetrics.platforms) 
          ? currentMetrics.platforms 
          : [];
    
        // Buat map dari platform name ke data platform
        const platformMap = new Map();
        existingPlatforms.forEach(platform => {
          if (platform && platform.name) {
            platformMap.set(platform.name, platform);
          }
        });
        
        // Buat platforms baru berdasarkan updates.platforms
        const newPlatforms = updates.platforms.map(platformName => {
          // Gunakan data yang sudah ada jika tersedia, atau buat baru
          if (platformMap.has(platformName)) {
            return platformMap.get(platformName);
          } else {
            return {
              name: platformName,
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              saved: 0,
              engagement_rate: 0
            };
          }
        });
        
        // Update metrics dengan platforms baru
        const updatedMetrics = {
          ...currentMetrics,
          platforms: newPlatforms
        };
        
        updateData.metrics = JSON.stringify(updatedMetrics);
      } else if (updates.metrics) {
        // Jika hanya metrics yang diupdate
        const updatedMetrics = {
          ...currentMetrics,
          ...updates.metrics
        };
        
        updateData.metrics = JSON.stringify(updatedMetrics);
      }
    }
    
    // Handle status change history
    if (updates.status && updates.status !== currentItem.status) {
      // Parse existing history
      const historyArray = currentItem.history 
        ? (typeof currentItem.history === 'string' 
          ? JSON.parse(currentItem.history) 
          : currentItem.history) 
        : [];
      
      // Add new history entry
      const newHistoryEntry: HistoryEntry = {
          timestamp: new Date(),
        previousStatus: currentItem.status as ContentStatus,
        newStatus: updates.status as ContentStatus
      };
      
      historyArray.push(newHistoryEntry);
      updateData.history = JSON.stringify(historyArray);
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
