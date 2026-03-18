// Type definitions for LocalPulse

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Report {
  id: string;
  userId: string;
  text: string;
  location: Location;
  timestamp: number;
  category: string;
  photoUrl?: string;
  customTags: string[];
  isAnonymous: boolean;
  upvotes: number;
  createdAt: any; // Firestore timestamp
  expiresAt?: number; // 24h expiration
}

export interface Summary {
  id: string;
  location: Location;
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

export interface User {
  id: string;
  email?: string;
  createdAt: number;
  preferences: {
    enableNotifications: boolean;
    defaultRadius: number;
    defaultTimeRange: "6h" | "12h" | "24h";
    darkMode: boolean;
    onboardingCompleted: boolean;
  };
}

export interface SummaryRequest {
  latitude: number;
  longitude: number;
  radiusKm: number;
  timeRangeHours: number;
}

export interface SummaryResponse {
  success: boolean;
  data?: Summary;
  error?: string;
}

export type ReportCategory = "Traffic" | "Safety" | "Event" | "Weather" | "Lost & Found" | "Other";

export interface UploadProgress {
  loaded: number;
  total: number;
}
