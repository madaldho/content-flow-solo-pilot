
import { v4 as uuidv4 } from 'uuid';
import { SweetSpotEntry, NicheStats, SweetSpotAnalysis } from '@/types/sweetSpot';

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
  private storageKey = 'sweetspot_data';
  private settingsKey = 'sweetspot_settings';
  
  // Default settings
  private defaultSettings = {
    targetRevenuePerMonth: 10000000, // Default target revenue (10 million Rp)
  };
  
  // Initial data is empty - user will add their own data
  getData(): SweetSpotEntry[] {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        return JSON.parse(storedData);
      } else {
        // First time use - return empty array
        this.saveData([]);
        return [];
      }
    } catch (error) {
      console.error("Error loading sweet spot data:", error);
      return [];
    }
  }
  
  // Get example/reference data
  getExampleData(): SweetSpotEntry[] {
    return exampleData;
  }
  
  // Save data to localStorage
  saveData(data: SweetSpotEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving sweet spot data:", error);
    }
  }
  
  // Get settings
  getSettings() {
    try {
      const settings = localStorage.getItem(this.settingsKey);
      if (settings) {
        return JSON.parse(settings);
      } else {
        this.saveSettings(this.defaultSettings);
        return this.defaultSettings;
      }
    } catch (error) {
      console.error("Error loading sweet spot settings:", error);
      return this.defaultSettings;
    }
  }
  
  // Save settings
  saveSettings(settings: any): void {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving sweet spot settings:", error);
    }
  }
  
  // Update target revenue
  updateTargetRevenue(amount: number): void {
    const settings = this.getSettings();
    settings.targetRevenuePerMonth = amount;
    this.saveSettings(settings);
  }
  
  // Create a new entry
  createEntry(entry: Omit<SweetSpotEntry, 'id'>): SweetSpotEntry {
    const newEntry = { ...entry, id: uuidv4() };
    const data = this.getData();
    this.saveData([...data, newEntry]);
    return newEntry;
  }
  
  // Get an entry by ID
  getEntry(id: string): SweetSpotEntry | undefined {
    return this.getData().find(entry => entry.id === id);
  }
  
  // Update an entry
  updateEntry(id: string, updates: Partial<SweetSpotEntry>): SweetSpotEntry | null {
    const data = this.getData();
    const index = data.findIndex(entry => entry.id === id);
    
    if (index === -1) return null;
    
    const updatedEntry = { ...data[index], ...updates };
    data[index] = updatedEntry;
    this.saveData(data);
    return updatedEntry;
  }
  
  // Delete an entry
  deleteEntry(id: string): boolean {
    const data = this.getData();
    const filteredData = data.filter(entry => entry.id !== id);
    
    if (filteredData.length === data.length) return false;
    
    this.saveData(filteredData);
    return true;
  }
  
  // Calculate analysis based on current data
  calculateAnalysis(data: SweetSpotEntry[]): SweetSpotAnalysis {
    // Get current settings
    const settings = this.getSettings();
    const targetRevenuePerMonth = settings.targetRevenuePerMonth || this.defaultSettings.targetRevenuePerMonth;
    
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
