import { ContentItem, ContentStatus, Platform, HistoryEntry, ContentStats } from '@/types/content';
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

// Convert ContentItem to database format
const mapContentItemToDbItem = (item: ContentItem) => {
  return {
    id: item.id,
    title: item.title,
    platform: item.platform,
    status: item.status,
    tags: item.tags,
    published_at: item.publicationDate?.toISOString() || null,
    content_link: item.contentLink || null,
    platform_links: item.platformLinks ? JSON.stringify(item.platformLinks) : null,
    is_endorsement: item.isEndorsement || false,
    is_collaboration: item.isCollaboration || false,
    endorsement_name: item.endorsementName || null,
    collaboration_name: item.collaborationName || null,
    endorsement_price: item.endorsementPrice || null,
  };
};

// Get all content items
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
};

// Fetch all content items (alias for getAllContent)
export const fetchContent = async (): Promise<ContentItem[]> => {
  return getAllContent();
};

// Create new content item
export const createContent = async (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> => {
  try {
    const newContent = {
      id: uuidv4(),
      ...mapContentItemToDbItem({
        ...contentData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const response = await fetch(getApiUrl('/content'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newContent),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return mapDbItemToContentItem(data);
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Update content item
export const updateContent = async (id: string, updates: Partial<ContentItem>): Promise<ContentItem> => {
  try {
    const updateData = mapContentItemToDbItem({
      ...updates,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ContentItem);

    const response = await fetch(getApiUrl(`/content/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return mapDbItemToContentItem(data);
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Delete content item
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const response = await fetch(getApiUrl(`/content/${id}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Get content by ID
export const getContentById = async (id: string): Promise<ContentItem | null> => {
  try {
    const response = await fetch(getApiUrl(`/content/${id}`));
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return mapDbItemToContentItem(data);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    throw error;
  }
};

// Get content by platform
export const getContentByPlatform = async (platform: string): Promise<ContentItem[]> => {
  try {
    const allContent = await getAllContent();
    return allContent.filter(item => item.platform === platform);
  } catch (error) {
    console.error('Error fetching content by platform:', error);
    throw error;
  }
};

// Get content by status
export const getContentByStatus = async (status: ContentStatus): Promise<ContentItem[]> => {
  try {
    const allContent = await getAllContent();
    return allContent.filter(item => item.status === status);
  } catch (error) {
    console.error('Error fetching content by status:', error);
    throw error;
  }
};

// Get content stats
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    const response = await fetch(getApiUrl('/content/stats'));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content stats:', error);
    throw error;
  }
};

// Search content
export const searchContent = async (query: string): Promise<ContentItem[]> => {
  try {
    const allContent = await getAllContent();
    const lowercaseQuery = query.toLowerCase();
    
    return allContent.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      item.platform.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

// Get recent content
export const getRecentContent = async (limit: number = 10): Promise<ContentItem[]> => {
  try {
    const allContent = await getAllContent();
    return allContent
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent content:', error);
    throw error;
  }
};
