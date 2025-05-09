
import { supabase } from "@/integrations/supabase/client";
import { ContentItem, ContentStatus, ContentTag, HistoryEntry, Platform } from "@/types/content";

// This service will manage the interactions with the Supabase database

/**
 * Fetch all content items from the database
 */
export async function fetchAllContentItems(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content items:', error);
    throw error;
  }

  // Convert dates and parse JSON fields
  return (data || []).map(item => {
    // Parse content_checklist with proper type checking
    const checklist = item.content_checklist ? (typeof item.content_checklist === 'object' ? item.content_checklist : JSON.parse(String(item.content_checklist))) : null;
    
    // Create a properly typed contentChecklist object
    const contentChecklist = {
      intro: checklist?.intro === true,
      mainPoints: checklist?.mainPoints === true,
      callToAction: checklist?.callToAction === true,
      outro: checklist?.outro === true
    };

    // Parse metrics with proper type checking
    const metrics = item.metrics ? 
      (typeof item.metrics === 'object' ? item.metrics : JSON.parse(String(item.metrics))) : 
      {};

    // Parse history with proper type checking - handle if the field doesn't exist
    let history: HistoryEntry[] = [];
    
    try {
      // Check if the history field exists in the database schema
      if ('history' in item) {
        const historyData = item.history;
        if (historyData) {
          const parsedHistory = typeof historyData === 'object' ? historyData : JSON.parse(String(historyData));
          history = Array.isArray(parsedHistory) ? parsedHistory.map((entry: any) => ({
            timestamp: new Date(entry.timestamp),
            previousStatus: entry.previousStatus,
            newStatus: entry.newStatus as ContentStatus,
            changedBy: entry.changedBy
          })) : [];
        }
      }
    } catch (e) {
      console.error('Error parsing history:', e);
      history = [];
    }

    return {
      id: item.id,
      title: item.title,
      platform: item.platform as Platform,
      status: item.status as ContentStatus,
      tags: item.tags as ContentTag[],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      publicationDate: item.publication_date ? new Date(item.publication_date) : undefined,
      notes: item.notes,
      referenceLink: item.reference_link,
      script: item.script,
      scriptFile: item.script_file,
      contentChecklist,
      productionNotes: item.production_notes,
      equipmentUsed: item.equipment_used,
      contentFiles: item.content_files,
      metrics,
      history
    };
  });
}

/**
 * Add a new content item to the database
 */
export async function addContentItem(item: Omit<ContentItem, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const itemToInsert = {
    title: item.title,
    platform: item.platform,
    status: item.status,
    tags: item.tags,
    publication_date: item.publicationDate?.toISOString(),
    notes: item.notes,
    reference_link: item.referenceLink,
    script: item.script,
    script_file: item.scriptFile,
    content_checklist: item.contentChecklist,
    production_notes: item.productionNotes,
    equipment_used: item.equipmentUsed,
    content_files: item.contentFiles,
    metrics: item.metrics,
    history: item.history || []
  };

  const { data, error } = await supabase
    .from('content_items')
    .insert(itemToInsert)
    .select();

  if (error) {
    console.error('Error adding content item:', error);
    throw error;
  }

  return data?.[0]?.id;
}

/**
 * Update an existing content item
 */
export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<void> {
  // Convert from camelCase to snake_case for the database
  const updatesForDb: Record<string, any> = {};
  
  if ('title' in updates) updatesForDb.title = updates.title;
  if ('platform' in updates) updatesForDb.platform = updates.platform;
  if ('status' in updates) updatesForDb.status = updates.status;
  if ('tags' in updates) updatesForDb.tags = updates.tags;
  if ('publicationDate' in updates) updatesForDb.publication_date = updates.publicationDate?.toISOString();
  if ('notes' in updates) updatesForDb.notes = updates.notes;
  if ('referenceLink' in updates) updatesForDb.reference_link = updates.referenceLink;
  if ('script' in updates) updatesForDb.script = updates.script;
  if ('scriptFile' in updates) updatesForDb.script_file = updates.scriptFile;
  if ('contentChecklist' in updates) updatesForDb.content_checklist = updates.contentChecklist;
  if ('productionNotes' in updates) updatesForDb.production_notes = updates.productionNotes;
  if ('equipmentUsed' in updates) updatesForDb.equipment_used = updates.equipmentUsed;
  if ('contentFiles' in updates) updatesForDb.content_files = updates.contentFiles;
  if ('metrics' in updates) updatesForDb.metrics = updates.metrics;
  if ('history' in updates) updatesForDb.history = updates.history;
  
  // Always update the updated_at timestamp
  updatesForDb.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('content_items')
    .update(updatesForDb)
    .eq('id', id);

  if (error) {
    console.error('Error updating content item:', error);
    throw error;
  }
}

export async function deleteContentItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content item:', error);
    throw error;
  }
}
