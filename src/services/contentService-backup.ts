import { ContentItem, ContentStatus, Platform, HistoryEntry, Co// Get all content items
export const getAllContent = async (): Promise<ContentItem[]> => {
  try {
    const response = await fetch(getApiUrl('/content'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapDbItemToContentItem);
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};rom '@/types/content';
import { v4 as uuidv4 } from 'uuid';
import { getApiUrl, apiRequest } from '@/lib/api-config';

// Convert database row to ContentItem format
const mapDbItemToContentItem = (item: unknown): ContentItem => {
  const dbItem = item as Record<string, unknown>;
  
  // Parse JSON fields
  const parseJson = (json: unknown) => {
    try {
      return typeof json === 'string' ? JSON.parse(json) : json;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return json;
    }
  };

  // Handle the history array
  const history = parseJson(dbItem.history) || [];

  // Handle platforms array - backwards compatibility
  const platforms: Platform[] = [];
  
  // Parse platform links
  const platformLinks = parseJson(dbItem.platform_links) || {};

  // Convert from DB format to app format
  return {
    id: dbItem.id as string,
    title: dbItem.title as string,
    platform: dbItem.platform as string,
    platforms: platforms,
    status: dbItem.status as ContentStatus,
    tags: (dbItem.tags as string[]) || [],
    createdAt: new Date(dbItem.created_at as string),
    updatedAt: new Date(dbItem.updated_at as string),
    publicationDate: dbItem.published_at ? new Date(dbItem.published_at as string) : undefined,
    notes: dbItem.notes as string,
    referenceLink: dbItem.reference_link as string,
    contentLink: dbItem.content_link as string,
    platformLinks: platformLinks,
    isEndorsement: (dbItem.is_endorsement as boolean) || false,
    isCollaboration: (dbItem.is_collaboration as boolean) || false,
    endorsementName: (dbItem.endorsement_name as string) || '',
    collaborationName: (dbItem.collaboration_name as string) || '',
    endorsementPrice: (dbItem.endorsement_price as string) || '',
    script: dbItem.script as string,
    scriptFile: dbItem.script_file as string,
    contentChecklist: parseJson(dbItem.content_checklist) || {
      intro: false,
      mainPoints: false,
      callToAction: false,
      outro: false
    },
    productionNotes: dbItem.production_notes as string,
    equipmentUsed: (dbItem.equipment_used as string[]) || [],
    contentFiles: (dbItem.content_files as string[]) || [],
    metrics: parseJson(dbItem.metrics) || {},
    history: history,
  };
};

// Fetch all content items
export const fetchContent = async (): Promise<ContentItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
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
    const id = uuidv4();
    
    const requestData = {
      id,
      title: content.title,
      platform: content.platform,
      status: content.status,
      tags: content.tags || [],
      published_at: content.publicationDate ? content.publicationDate.toISOString() : null,
      content_link: content.contentLink || null,
      platform_links: content.platformLinks || {},
      is_endorsement: content.isEndorsement || false,
      is_collaboration: content.isCollaboration || false,
      endorsement_name: content.endorsementName || null,
      collaboration_name: content.collaborationName || null,
      endorsement_price: content.endorsementPrice || null,
    };

    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error adding content:', error);
    throw error;
  }
};

// Update a content item
export const updateContent = async (
  id: string,
  updates: Partial<ContentItem>
): Promise<void> => {
  try {
    const requestData: Record<string, unknown> = {};

    // Map frontend format to backend format
    if (updates.title !== undefined) requestData.title = updates.title;
    if (updates.platform !== undefined) requestData.platform = updates.platform;
    if (updates.status !== undefined) requestData.status = updates.status;
    if (updates.tags !== undefined) requestData.tags = updates.tags;
    if (updates.publicationDate !== undefined) {
      requestData.published_at = updates.publicationDate ? updates.publicationDate.toISOString() : null;
    }
    if (updates.contentLink !== undefined) requestData.content_link = updates.contentLink;
    if (updates.platformLinks !== undefined) requestData.platform_links = updates.platformLinks;
    if (updates.isEndorsement !== undefined) requestData.is_endorsement = updates.isEndorsement;
    if (updates.isCollaboration !== undefined) requestData.is_collaboration = updates.isCollaboration;
    if (updates.endorsementName !== undefined) requestData.endorsement_name = updates.endorsementName;
    if (updates.collaborationName !== undefined) requestData.collaboration_name = updates.collaborationName;
    if (updates.endorsementPrice !== undefined) requestData.endorsement_price = updates.endorsementPrice;

    const response = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Delete a content item
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Get content by ID
export const getContentById = async (id: string): Promise<ContentItem | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return mapDbItemToContentItem(data);
  } catch (error) {
    console.error('Error getting content by ID:', error);
    throw error;
  }
};

// Get content by status
export const getContentByStatus = async (status: ContentStatus): Promise<ContentItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const allItems = data.map(mapDbItemToContentItem);
    return allItems.filter(item => item.status === status);
  } catch (error) {
    console.error('Error getting content by status:', error);
    throw error;
  }
};

// Get content stats
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting content stats:', error);
    throw error;
  }
};
