
import { v4 as uuidv4 } from 'uuid';
import { SweetSpotEntry, NicheStats, SweetSpotAnalysis } from '@/types/sweetSpot';
import { API_BASE_URL } from '@/lib/api-config';

// Interface untuk database row format
interface SweetSpotDbRow {
  id: string;
  niche: string;
  account: string;
  keywords: string;
  audience: number;
  revenue_stream: string;
  pricing: string;
}

// Interface untuk database entry format
interface SweetSpotDbEntry {
  niche: string;
  account: string;
  keywords: string;
  audience: number;
  revenue_stream: string;
  pricing: string;
}

// Interface untuk settings
interface SweetSpotSettings {
  targetRevenuePerMonth: number;
}

// Interface untuk database settings
interface SweetSpotDbSettings {
  target_revenue_per_month: number;
}

// Sample data for reference
const exampleData: SweetSpotEntry[] = [
  { id: uuidv4(), niche: "KEY NICHE", account: "elaak", keywords: "Traveling", audience: 534000, revenueStream: "Endorsement", pricing: "Rp1,000,000" },
  { id: uuidv4(), niche: "KEY NICHE", account: "Adi Putra", keywords: "Traveling", audience: 117000, revenueStream: "Course", pricing: "Rp250,000" },
  { id: uuidv4(), niche: "KEY NICHE", account: "Anjar", keywords: "Traveling", audience: 15900, revenueStream: "Webinar", pricing: "Rp300,000" },
  { id: uuidv4(), niche: "KEY NICHE", account: "Sejauh Angin", keywords: "Traveling Information", audience: 65100, revenueStream: "Endorsement", pricing: "Rp1,000,000" },
  { id: uuidv4(), niche: "KEY NICHE", account: "Furky Syahroni", keywords: "Traveling", audience: 134000, revenueStream: "Endorsement", pricing: "Rp1,000,000" },
  { id: uuidv4(), niche: "BENANG MERAH NICHE", account: "Borneo Bodyfit", keywords: "Fitness", audience: 12300, revenueStream: "Endorsement", pricing: "Rp1,000,000" },
  { id: uuidv4(), niche: "BENANG MERAH NICHE", account: "Brodibalo", keywords: "Fitness", audience: 274000, revenueStream: "Course", pricing: "Rp250,000" },
  { id: uuidv4(), niche: "BENANG MERAH NICHE", account: "Christian Dicky", keywords: "Fitness", audience: 76400, revenueStream: "Webinar", pricing: "Rp300,000" },
];

class SweetSpotService {
  private defaultSettings = {
    targetRevenuePerMonth: 10000000, // Default target revenue (10 million Rp)
  };

  // Convert database row to SweetSpotEntry
  private mapDbRowToEntry(row: SweetSpotDbRow): SweetSpotEntry {
    return {
      id: row.id,
      niche: row.niche,
      account: row.account,
      keywords: row.keywords,
      audience: row.audience,
      revenueStream: row.revenue_stream,
      pricing: row.pricing,
    };
  }

  // Convert SweetSpotEntry to database format
  private mapEntryToDbFormat(entry: Omit<SweetSpotEntry, 'id'>): SweetSpotDbEntry {
    return {
      niche: entry.niche,
      account: entry.account,
      keywords: entry.keywords,
      audience: entry.audience,
      revenue_stream: entry.revenueStream,
      pricing: entry.pricing,
    };
  }
  
  // Get all sweet spot entries from database
  async getData(): Promise<SweetSpotEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-entries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map(this.mapDbRowToEntry);
    } catch (error) {
      console.error("Error loading sweet spot data:", error);
      return [];
    }
  }
  
  // Get example/reference data
  getExampleData(): SweetSpotEntry[] {
    return exampleData;
  }
  
  // Get settings from database
  async getSettings(): Promise<SweetSpotSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-settings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        targetRevenuePerMonth: data.target_revenue_per_month || this.defaultSettings.targetRevenuePerMonth,
      };
    } catch (error) {
      console.error("Error loading sweet spot settings:", error);
      return this.defaultSettings;
    }
  }
  
  // Save settings to database
  async saveSettings(settings: SweetSpotSettings): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_revenue_per_month: settings.targetRevenuePerMonth,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving sweet spot settings:", error);
      throw error;
    }
  }
  
  // Update target revenue
  async updateTargetRevenue(amount: number): Promise<void> {
    const settings = await this.getSettings();
    settings.targetRevenuePerMonth = amount;
    await this.saveSettings(settings);
  }
  
  // Create a new entry
  async createEntry(entry: Omit<SweetSpotEntry, 'id'>): Promise<SweetSpotEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapEntryToDbFormat(entry)),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapDbRowToEntry(data);
    } catch (error) {
      console.error("Error creating sweet spot entry:", error);
      throw error;
    }
  }
  
  // Get an entry by ID
  async getEntry(id: string): Promise<SweetSpotEntry | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-entries?id=${id}`);
      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.mapDbRowToEntry(data);
    } catch (error) {
      console.error("Error fetching sweet spot entry:", error);
      return undefined;
    }
  }
  
  // Update an entry
  async updateEntry(id: string, updates: Partial<SweetSpotEntry>): Promise<SweetSpotEntry | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-entries?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapEntryToDbFormat(updates as Omit<SweetSpotEntry, 'id'>)),
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapDbRowToEntry(data);
    } catch (error) {
      console.error("Error updating sweet spot entry:", error);
      return null;
    }
  }
  
  // Delete an entry
  async deleteEntry(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/sweetspot-entries?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) return false;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting sweet spot entry:", error);
      return false;
    }
  }
  
  // Calculate analysis based on current data
  async calculateAnalysis(data?: SweetSpotEntry[]): Promise<SweetSpotAnalysis> {
    // Get current settings
    const settings = await this.getSettings();
    const targetRevenuePerMonth = settings.targetRevenuePerMonth || this.defaultSettings.targetRevenuePerMonth;
    // Get data if not provided
    if (!data) {
      data = await this.getData();
    }
    
    if (!data || data.length === 0) {
      return {
        niches: [],
        grandTotal: 0,
        conversion: 0,
        salesPerMonth: 0,
        revenuePerMonth: this.formatCurrency(targetRevenuePerMonth),
        productPrice: this.formatCurrency(targetRevenuePerMonth), // Default when no sales
      };
    }
    
    const nicheMap = new Map<string, SweetSpotEntry[]>();
    
    // Group entries by niche
    data.forEach(entry => {
      const entries = nicheMap.get(entry.niche) || [];
      entries.push(entry);
      nicheMap.set(entry.niche, entries);
    });
    
    // Calculate stats for each niche
    const niches: NicheStats[] = [];
    let grandTotal = 0;
    
    nicheMap.forEach((entries, niche) => {
      const total = entries.reduce((sum, entry) => sum + entry.audience, 0);
      const assumptionPercentage = niche === "KEY NICHE" ? 10 : 5;
      const assumptionAudience = Math.round(total * (assumptionPercentage / 100));
      
      niches.push({
        niche,
        total,
        assumptionPercentage,
        assumptionAudience,
        entries,
      });
      
      grandTotal += assumptionAudience;
    });
    
    // Calculate final stats
    const conversion = Math.round(grandTotal * 0.01);
    const salesPerMonth = Math.round(conversion / 24);
    
    // Calculate product price based on target monthly revenue and sales per month
    let productPrice = 0;
    if (salesPerMonth > 0) {
      productPrice = Math.round(targetRevenuePerMonth / salesPerMonth);
    } else {
      productPrice = targetRevenuePerMonth; // Fallback if no sales
    }
    
    return {
      niches,
      grandTotal,
      conversion,
      salesPerMonth,
      revenuePerMonth: this.formatCurrency(targetRevenuePerMonth),
      productPrice: this.formatCurrency(productPrice),
    };
  }
  
  // Format currency to Indonesian Rupiah
  formatCurrency(amount: number): string {
    return `Rp${amount.toLocaleString('id-ID')}`;
  }
  
  // Parse currency string to number
  parseCurrency(currencyStr: string): number {
    // Remove "Rp" and any non-numeric characters except digits
    return parseInt(currencyStr.replace(/[^0-9]/g, '')) || 0;
  }
}

export const sweetSpotService = new SweetSpotService();
