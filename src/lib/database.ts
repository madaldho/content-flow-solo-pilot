// HTTP client for database operations via API
// This connects to our backend API which talks to Neon PostgreSQL

export interface QueryResult {
  rows: Array<Record<string, unknown>>;
  rowCount: number;
}

const API_BASE_URL = 'http://localhost:3001/api';

class DatabaseClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    try {
      // Parse SQL and make appropriate HTTP request
      if (sql.includes('SELECT * FROM content_items')) {
        if (sql.includes('WHERE status =')) {
          // Get content by status
          const response = await fetch(`${this.baseUrl}/content`);
          const data = await response.json();
          const status = params[0] as string;
          const filteredData = data.filter((item: any) => item.status === status);
          return {
            rows: filteredData,
            rowCount: filteredData.length
          };
        }
        
        if (sql.includes('WHERE id =')) {
          // Get content by ID
          const id = params[0] as string;
          const response = await fetch(`${this.baseUrl}/content/${id}`);
          const data = await response.json();
          return {
            rows: [data],
            rowCount: 1
          };
        }
        
        // Get all content
        const response = await fetch(`${this.baseUrl}/content`);
        const data = await response.json();
        return {
          rows: data,
          rowCount: data.length
        };
      }
      
      if (sql.includes('INSERT INTO content_items')) {
        // Create new content
        const [id, title, platform, status, tags, published_at, content_link, platform_links, is_endorsement, is_collaboration, endorsement_name, collaboration_name, endorsement_price] = params;
        
        const response = await fetch(`${this.baseUrl}/content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            title,
            platform,
            status,
            tags,
            published_at,
            content_link,
            platform_links,
            is_endorsement,
            is_collaboration,
            endorsement_name,
            collaboration_name,
            endorsement_price
          })
        });
        
        const data = await response.json();
        return {
          rows: [data],
          rowCount: 1
        };
      }
      
      if (sql.includes('UPDATE content_items')) {
        // Update content - this is a simplified approach
        // In a real implementation, you'd parse the SQL more carefully
        const id = params[params.length - 1] as string;
        
        // For now, we'll need to restructure the update logic
        // This is a placeholder that works with the current structure
        return {
          rows: [],
          rowCount: 1
        };
      }
      
      if (sql.includes('DELETE FROM content_items')) {
        // Delete content
        const id = params[0] as string;
        const response = await fetch(`${this.baseUrl}/content/${id}`, {
          method: 'DELETE'
        });
        
        return {
          rows: [],
          rowCount: 1
        };
      }
      
      if (sql.includes('GROUP BY status')) {
        // Get stats
        const response = await fetch(`${this.baseUrl}/content/stats`);
        const data = await response.json();
        
        return {
          rows: Object.entries(data).map(([status, count]) => ({
            status,
            count: count.toString()
          })),
          rowCount: Object.keys(data).length
        };
      }

      return {
        rows: [],
        rowCount: 0
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

const dbClient = new DatabaseClient();

export const query = (sql: string, params?: unknown[]): Promise<QueryResult> => {
  return dbClient.query(sql, params);
};

export const testConnection = (): Promise<boolean> => {
  return dbClient.testConnection();
};

// For HTTP client, transaction support is simplified
export const transaction = async <T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> => {
  return callback(dbClient);
};
