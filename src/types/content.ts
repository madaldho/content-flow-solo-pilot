
export type Platform = 
  | "YouTube" 
  | "TikTok" 
  | "Instagram" 
  | "Twitter" 
  | "LinkedIn" 
  | "Blog" 
  | "Podcast" 
  | "Other"
  | string;  // Allow custom platforms

export type ContentTag = 
  | "Education" 
  | "Entertainment" 
  | "Promotion" 
  | "Tutorial" 
  | "Review" 
  | "Vlog" 
  | "Interview" 
  | "Announcement" 
  | "Other"
  | string;  // Allow custom tags

export type ContentStatus = 
  | "Idea" 
  | "Script" 
  | "Recorded" 
  | "Edited" 
  | "Ready to Publish" 
  | "Published";

export interface HistoryEntry {
  timestamp: Date;
  previousStatus?: ContentStatus;
  newStatus: ContentStatus;
  changedBy?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;      // Keep for backward compatibility
  platforms: Platform[];   // Add multi-platform support
  status: ContentStatus;
  tags: ContentTag[];
  createdAt: Date;
  updatedAt: Date;
  publicationDate?: Date;
  notes?: string;
  referenceLink?: string;
  script?: string;
  scriptFile?: string;
  contentChecklist: {
    intro: boolean;
    mainPoints: boolean;
    callToAction: boolean;
    outro: boolean;
  };
  productionNotes?: string;
  equipmentUsed?: string[];
  contentFiles?: string[];
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    rating?: number;
    insights?: string;
  };
  history?: HistoryEntry[];
}

export interface ContentStats {
  totalActive: number;
  publishedThisWeek: number;
  bestPerforming?: {
    id: string;
    title: string;
    platform: Platform;
    metrics: {
      views?: number;
      likes?: number;
      comments?: number;
      shares?: number;
    };
  };
  unfinishedCount: number;
  statusBreakdown: Record<ContentStatus, number>;
}

export interface ContentContextType {
  contentItems: ContentItem[];
  isLoading: boolean;
  error: Error | null;
  platforms: Platform[];
  tags: ContentTag[];
  addCustomPlatform: (platform: Platform) => void;
  addCustomTag: (tag: ContentTag) => void;
  updateCustomPlatform: (oldPlatform: Platform, newPlatform: Platform) => void;
  updateCustomTag: (oldTag: ContentTag, newTag: ContentTag) => void;
  removeCustomPlatform: (platform: Platform) => void;
  removeCustomTag: (tag: ContentTag) => void;
  resetCustomOptions: (type: "platform" | "tag") => void;
  addContentItem: (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "contentChecklist" | "history">) => Promise<string>;
  updateContentItem: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  getContentStats: () => ContentStats;
  getContentByStatus: (status: ContentStatus) => ContentItem[];
  exportToCSV: () => void;
  getContentById: (id: string) => ContentItem | undefined;
}
