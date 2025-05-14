
import { supabase } from '@/integrations/supabase/client';
import { ContentInspiration, ContentInspirationCategory, InspirationSource } from '@/types/inspiration';
import { v4 as uuidv4 } from 'uuid';

// Convert Supabase response to ContentInspiration format
const mapDbItemToContentInspiration = (item: any): ContentInspiration => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    sourceAccount: item.source_account,
    sourceUrl: item.source_url,
    sourceType: item.source_type as InspirationSource,
    categories: item.categories || [],
    screenshotUrl: item.screenshot_url,
    notes: item.notes,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    tags: item.tags || [],
    isFavorite: item.is_favorite || false,
    niche: item.niche
  };
};

// Fetch all content inspirations
export const fetchInspirations = async (): Promise<ContentInspiration[]> => {
  try {
    const { data, error } = await supabase
      .from('content_inspirations')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(mapDbItemToContentInspiration);
  } catch (error) {
    console.error('Error fetching inspirations:', error);
    throw error;
  }
};

// Add a new inspiration
export const addInspiration = async (
  inspiration: Omit<ContentInspiration, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const { error } = await supabase
      .from('content_inspirations')
      .insert({
        id,
        title: inspiration.title,
        description: inspiration.description,
        source_account: inspiration.sourceAccount,
        source_url: inspiration.sourceUrl,
        source_type: inspiration.sourceType,
        categories: inspiration.categories,
        screenshot_url: inspiration.screenshotUrl,
        notes: inspiration.notes,
        tags: inspiration.tags || [],
        is_favorite: inspiration.isFavorite || false,
        niche: inspiration.niche,
        created_at: now,
        updated_at: now
      });
      
    if (error) throw error;
    
    return id;
  } catch (error) {
    console.error('Error adding inspiration:', error);
    throw error;
  }
};

// Update an existing inspiration
export const updateInspiration = async (
  id: string, 
  updates: Partial<ContentInspiration>
): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.sourceAccount !== undefined) updateData.source_account = updates.sourceAccount;
    if (updates.sourceUrl !== undefined) updateData.source_url = updates.sourceUrl;
    if (updates.sourceType !== undefined) updateData.source_type = updates.sourceType;
    if (updates.categories !== undefined) updateData.categories = updates.categories;
    if (updates.screenshotUrl !== undefined) updateData.screenshot_url = updates.screenshotUrl;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
    if (updates.niche !== undefined) updateData.niche = updates.niche;
    
    const { error } = await supabase
      .from('content_inspirations')
      .update(updateData)
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating inspiration:', error);
    throw error;
  }
};

// Delete an inspiration
export const deleteInspiration = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('content_inspirations')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting inspiration:', error);
    throw error;
  }
};

// Get an inspiration by ID
export const getInspirationById = async (id: string): Promise<ContentInspiration | null> => {
  try {
    const { data, error } = await supabase
      .from('content_inspirations')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    return mapDbItemToContentInspiration(data);
  } catch (error) {
    console.error('Error fetching inspiration:', error);
    throw error;
  }
};

// Export to CSV
export const exportToCSV = (inspirations: ContentInspiration[]): void => {
  // CSV header
  const header = [
    'Title', 
    'Description', 
    'Source Account', 
    'Source Type', 
    'Source URL', 
    'Categories', 
    'Notes',
    'Tags',
    'Niche'
  ].join(',');
  
  // CSV rows
  const rows = inspirations.map(item => {
    return [
      `"${item.title.replace(/"/g, '""')}"`, 
      `"${item.description ? item.description.replace(/"/g, '""') : ''}"`,
      `"${item.sourceAccount}"`,
      item.sourceType,
      `"${item.sourceUrl || ''}"`,
      `"${item.categories.join(', ')}"`,
      `"${item.notes ? item.notes.replace(/"/g, '""') : ''}"`,
      `"${item.tags ? item.tags.join(', ') : ''}"`,
      `"${item.niche || ''}"`
    ].join(',');
  });
  
  // Combine header and rows
  const csv = [header, ...rows].join('\n');
  
  // Create and download the CSV file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `content-inspirations-${new Date().toLocaleDateString()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
