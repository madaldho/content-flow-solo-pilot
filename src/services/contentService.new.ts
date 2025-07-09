import { query, transaction } from '@/lib/database';
import { ContentItem, ContentStatus, Platform, HistoryEntry, ContentStats } from '@/types/content';
import { v4 as uuidv4 } from 'uuid';

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
    const result = await query(`
      SELECT * FROM content_items 
      ORDER BY updated_at DESC
    `);
    
    if (!result.rows) return [];
    
    return result.rows.map(mapDbItemToContentItem);
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
    const now = new Date();
    
    // Format publication date
    const publishedAt = content.publicationDate ? content.publicationDate.toISOString() : null;
    
    // Create initial history entry
    const historyEntry: HistoryEntry = {
      timestamp: now,
      newStatus: content.status,
    };

    const insertQuery = `
      INSERT INTO content_items (
        id, title, platform, status, tags, published_at, 
        content_link, platform_links, is_endorsement, is_collaboration,
        endorsement_name, collaboration_name, endorsement_price,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `;

    const values = [
      id,
      content.title,
      content.platform,
      content.status,
      content.tags || [],
      publishedAt,
      content.contentLink || null,
      JSON.stringify(content.platformLinks || {}),
      content.isEndorsement || false,
      content.isCollaboration || false,
      content.endorsementName || null,
      content.collaborationName || null,
      content.endorsementPrice || null,
      now.toISOString(),
      now.toISOString()
    ];

    const result = await query(insertQuery, values);
    
    if (!result.rows?.[0]) {
      throw new Error('Failed to create content item');
    }

    return result.rows[0].id;
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
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    
    if (updates.platform !== undefined) {
      updateFields.push(`platform = $${paramIndex++}`);
      values.push(updates.platform);
    }
    
    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    
    if (updates.tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`);
      values.push(updates.tags);
    }
    
    if (updates.publicationDate !== undefined) {
      updateFields.push(`published_at = $${paramIndex++}`);
      values.push(updates.publicationDate ? updates.publicationDate.toISOString() : null);
    }
    
    if (updates.contentLink !== undefined) {
      updateFields.push(`content_link = $${paramIndex++}`);
      values.push(updates.contentLink);
    }
    
    if (updates.platformLinks !== undefined) {
      updateFields.push(`platform_links = $${paramIndex++}`);
      values.push(JSON.stringify(updates.platformLinks));
    }
    
    if (updates.isEndorsement !== undefined) {
      updateFields.push(`is_endorsement = $${paramIndex++}`);
      values.push(updates.isEndorsement);
    }
    
    if (updates.isCollaboration !== undefined) {
      updateFields.push(`is_collaboration = $${paramIndex++}`);
      values.push(updates.isCollaboration);
    }
    
    if (updates.endorsementName !== undefined) {
      updateFields.push(`endorsement_name = $${paramIndex++}`);
      values.push(updates.endorsementName);
    }
    
    if (updates.collaborationName !== undefined) {
      updateFields.push(`collaboration_name = $${paramIndex++}`);
      values.push(updates.collaborationName);
    }
    
    if (updates.endorsementPrice !== undefined) {
      updateFields.push(`endorsement_price = $${paramIndex++}`);
      values.push(updates.endorsementPrice);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());

    // Add the ID for WHERE clause
    values.push(id);

    const updateQuery = `
      UPDATE content_items 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
    `;

    await query(updateQuery, values);
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Delete a content item
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const deleteQuery = 'DELETE FROM content_items WHERE id = $1';
    await query(deleteQuery, [id]);
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Get content by ID
export const getContentById = async (id: string): Promise<ContentItem | null> => {
  try {
    const result = await query('SELECT * FROM content_items WHERE id = $1', [id]);
    
    if (!result.rows?.[0]) {
      return null;
    }

    return mapDbItemToContentItem(result.rows[0]);
  } catch (error) {
    console.error('Error getting content by ID:', error);
    throw error;
  }
};

// Get content by status
export const getContentByStatus = async (status: ContentStatus): Promise<ContentItem[]> => {
  try {
    const result = await query(
      'SELECT * FROM content_items WHERE status = $1 ORDER BY updated_at DESC',
      [status]
    );
    
    if (!result.rows) return [];
    
    return result.rows.map(mapDbItemToContentItem);
  } catch (error) {
    console.error('Error getting content by status:', error);
    throw error;
  }
};

// Get content stats
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    const result = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM content_items 
      GROUP BY status
    `);

    const stats: ContentStats = {
      total: 0,
      draft: 0,
      scheduled: 0,
      published: 0,
      archived: 0
    };

    result.rows.forEach(row => {
      stats.total += parseInt(row.count);
      const status = row.status as keyof ContentStats;
      if (status in stats) {
        stats[status] = parseInt(row.count);
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting content stats:', error);
    throw error;
  }
};
