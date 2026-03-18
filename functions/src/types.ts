export interface Report {
  id: string;
  userId: string;
  text: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  category: string;
  photoUrl?: string;
  customTags: string[];
  isAnonymous: boolean;
  upvotes: number;
  createdAt: any;
  expiresAt?: number;
}

export interface Summary {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  headline: string;
  bullets: SummaryBullet[];
  reportCount: number;
  generatedAt: number;
  lastUpdatedAt: number;
  timeRange: "6h" | "12h" | "24h";
}

export interface SummaryBullet {
  text: string;
  reportCount: number;
  category?: string;
  relatedReportIds: string[];
}

export interface SummaryRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  timeRangeHours: number;
}

export interface ModerationResult {
  approved: boolean;
  reason?: string;
  confidence?: number;
}
