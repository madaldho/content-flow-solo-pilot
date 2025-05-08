
export type Platform = 
  | "YouTube" 
  | "TikTok" 
  | "Instagram" 
  | "Twitter" 
  | "LinkedIn" 
  | "Blog" 
  | "Podcast" 
  | "Other";

export type ContentTag = 
  | "Education" 
  | "Entertainment" 
  | "Promotion" 
  | "Tutorial" 
  | "Review" 
  | "Vlog" 
  | "Interview" 
  | "Announcement" 
  | "Other";

export type ContentStatus = 
  | "Idea" 
  | "Script" 
  | "Recorded" 
  | "Edited" 
  | "Ready to Publish" 
  | "Published";

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
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
