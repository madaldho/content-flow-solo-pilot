
export interface SweetSpotEntry {
  id: string;
  niche: string;
  account: string;
  keywords: string;
  audience: number;
  revenueStream: string;
  pricing: string;
}

export interface NicheStats {
  niche: string;
  total: number;
  assumptionPercentage: number;
  assumptionAudience: number;
  entries: SweetSpotEntry[];
}

export interface SweetSpotAnalysis {
  niches: NicheStats[];
  grandTotal: number;
  conversion: number;
  salesPerMonth: number;
  revenuePerMonth: string;
  productPrice: string;
}
