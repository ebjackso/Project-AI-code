import { ReportCategory } from "@types";

export const REPORT_CATEGORIES: ReportCategory[] = [
  "Traffic",
  "Safety",
  "Event",
  "Weather",
  "Lost & Found",
  "Other",
];

export const RADIUS_OPTIONS = [1, 3, 5, 10] as const;
export const DEFAULT_RADIUS = 5;
export const DEFAULT_TIME_RANGE = 24;

export const TIME_RANGE_OPTIONS = [
  { label: "Last 6 hours", value: 6 },
  { label: "Last 12 hours", value: 12 },
  { label: "Last 24 hours", value: 24 },
];

export const REPORT_MIN_LENGTH = 10;
export const REPORT_MAX_LENGTH = 500;

export const API_RATE_LIMIT = {
  maxReportsPerHour: 10,
  maxReportsPerDay: 50,
};

// Colors for dark mode
export const COLORS = {
  dark: {
    bg: "#0F172A",
    bgSecondary: "#1E293B",
    text: "#F1F5F9",
    textSecondary: "#CBD5E1",
    border: "#334155",
    primary: "#3B82F6",
    secondary: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
  },
};

export const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "Report What's Happening",
    description: "Share quick updates about traffic, events, safety issues, and more in your neighborhood.",
    icon: "📍",
  },
  {
    id: 2,
    title: "AI Summarizes for Everyone",
    description: "Our AI analyzes all reports in your area and creates a clear, concise summary of what's happening right now.",
    icon: "✨",
  },
  {
    id: 3,
    title: "Stay Informed in Real-Time",
    description: "Get instant updates about your neighborhood. Check the map anytime to see current summaries.",
    icon: "🚀",
  },
];

export function validateReport(text: string): { valid: boolean; error?: string } {
  if (text.length < REPORT_MIN_LENGTH) {
    return { valid: false, error: `Report must be at least ${REPORT_MIN_LENGTH} characters` };
  }
  if (text.length > REPORT_MAX_LENGTH) {
    return { valid: false, error: `Report must not exceed ${REPORT_MAX_LENGTH} characters` };
  }
  return { valid: true };
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export function getTimeRangeLabel(hours: number): string {
  if (hours === 6) return "Last 6 hours";
  if (hours === 12) return "Last 12 hours";
  if (hours === 24) return "Last 24 hours";
  return `Last ${hours} hours`;
}
