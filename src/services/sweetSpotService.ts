
import { v4 as uuidv4 } from 'uuid';
import { SweetSpotEntry, SweetSpotAnalysis } from '@/types/sweetSpot';

class SweetSpotService {
  private storageKey = 'sweetspot-data';
  private assumptionsKey = 'sweetspot-assumptions';
  private targetRevenueKey = 'sweetspot-target-revenue';
  
  // Get entries from localStorage
  getEntries(): SweetSpotEntry[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Save an entry
  saveEntry(entry: Omit<SweetSpotEntry, 'id' | 'createdAt' | 'updatedAt'>): SweetSpotEntry {
    const entries = this.getEntries();
    const newEntry: SweetSpotEntry = {
      id: uuidv4(),
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    entries.push(newEntry);
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
    return newEntry;
  }

  // Update an entry
  updateEntry(id: string, updates: Partial<SweetSpotEntry>): SweetSpotEntry | null {
    const entries = this.getEntries();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    entries[index] = updatedEntry;
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
    return updatedEntry;
  }

  // Delete an entry
  deleteEntry(id: string): boolean {
    const entries = this.getEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) {
      return false;
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredEntries));
    return true;
  }

  // Get all niches
  getNiches(): string[] {
    const entries = this.getEntries();
    return [...new Set(entries.map(entry => entry.niche))];
  }

  // Group entries by niche
  getEntriesByNiche(): Record<string, SweetSpotEntry[]> {
    const entries = this.getEntries();
    return entries.reduce((acc, entry) => {
      if (!acc[entry.niche]) {
        acc[entry.niche] = [];
      }
      acc[entry.niche].push(entry);
      return acc;
    }, {} as Record<string, SweetSpotEntry[]>);
  }

  // Calculate sweet spot analysis
  calculateAnalysis(): SweetSpotAnalysis {
    const entries = this.getEntries();
    const niches = this.getNiches();
    
    // Grand Total (all audience)
    const grandTotal = entries.reduce((sum, entry) => sum + entry.audience, 0);
    
    // Apply 1% conversion rate for total conversion
    const conversion = Math.round(grandTotal * 0.01);
    
    // Estimate sales per month (4% of conversion)
    const salesPerMonth = Math.round(conversion * 0.04);
    
    // Get target revenue or calculate default
    const targetRevenue = this.getTargetRevenue() || 50000000;
    
    // Calculate product price based on revenue and sales
    const productPrice = salesPerMonth > 0 
      ? Math.round(targetRevenue / salesPerMonth) 
      : 0;
      
    // Format as IDR currency
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    });
    
    return {
      grandTotal,
      conversion,
      salesPerMonth,
      revenuePerMonth: formatter.format(targetRevenue),
      productPrice: formatter.format(productPrice)
    };
  }

  // Parse currency string back to number
  parseCurrency(currencyString: string): number {
    // Remove currency symbol, dots, and commas
    const numericString = currencyString
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');
      
    return parseInt(numericString, 10);
  }

  // Get target revenue
  getTargetRevenue(): number | null {
    const revenue = localStorage.getItem(this.targetRevenueKey);
    return revenue ? parseInt(revenue, 10) : null;
  }

  // Update target revenue
  updateTargetRevenue(revenue: number): void {
    localStorage.setItem(this.targetRevenueKey, revenue.toString());
  }

  // Load example data
  loadExampleData(): void {
    const exampleData: SweetSpotEntry[] = [
      {
        id: uuidv4(),
        account: "TravelWithMe",
        niche: "Travel",
        platform: "Instagram",
        audience: 250000,
        revenueStream: "Course",
        pricing: 1500000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        account: "FitnessPro",
        niche: "Fitness",
        platform: "YouTube",
        audience: 500000,
        revenueStream: "Subscription",
        pricing: 99000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        account: "CookWithMe",
        niche: "Cooking",
        platform: "TikTok",
        audience: 1200000,
        revenueStream: "Endorsement",
        pricing: 5000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem(this.storageKey, JSON.stringify(exampleData));
  }

  // Clear all data
  clearData(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.assumptionsKey);
  }
}

export const sweetSpotService = new SweetSpotService();
