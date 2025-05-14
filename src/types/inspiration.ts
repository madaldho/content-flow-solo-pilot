
export type InspirationSource = 
  | "Instagram" 
  | "TikTok" 
  | "YouTube" 
  | "Twitter" 
  | "LinkedIn" 
  | "Pinterest" 
  | "Facebook"
  | "Blog"
  | "Other";

export type ContentInspirationCategory =
  | "Product Review"
  | "Tutorial"
  | "Interview"
  | "Behind the Scenes"
  | "Trends"
  | "Case Study"
  | "Q&A"
  | "User Generated"
  | "Educational"
  | "Entertainment"
  | "Promotional"
  | "Informative"
  | "Other";

export interface ContentInspiration {
  id: string;
  title: string;
  description?: string;
  sourceAccount: string;
  sourceUrl?: string;
  sourceType: InspirationSource;
  categories: ContentInspirationCategory[];
  screenshotUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isFavorite?: boolean;
  niche?: string;
}

export interface InspirationContextType {
  inspirations: ContentInspiration[];
  isLoading: boolean;
  error: Error | null;
  categories: ContentInspirationCategory[];
  sourceTypes: InspirationSource[];
  addInspiration: (item: Omit<ContentInspiration, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateInspiration: (id: string, updates: Partial<ContentInspiration>) => Promise<void>;
  deleteInspiration: (id: string) => Promise<void>;
  getInspirationById: (id: string) => ContentInspiration | undefined;
  addCustomCategory: (category: ContentInspirationCategory) => void;
  exportToCSV: () => void;
}
