
export type SweetSpotEntry = {
  id: string;
  account: string;
  niche: string;
  audience: number;
  platform: string;
  revenueStream: string;
  pricing: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SweetSpotAnalysis = {
  grandTotal: number;
  conversion: number;
  salesPerMonth: number;
  revenuePerMonth: string; // Formatted currency string
  productPrice: string; // Formatted currency string
};

export type SweetSpotAssumption = {
  niche: string;
  engagementRate: number;
  conversionRate: number;
  buyerRate: number;
};

export type SweetSpotResult = {
  niche: string;
  engagedAudience: number;
  interestedAudience: number;
  buyers: number;
  revenue: number;
};
