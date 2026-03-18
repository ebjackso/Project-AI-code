import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Report, Summary, User, Location } from "@types";

interface AppState {
  // Auth
  userId: string | null;
  setUserId: (id: string) => void;

  // User data
  user: User | null;
  setUser: (user: User | null) => void;

  // Location
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;

  // Map state
  mapLocation: Location | null;
  setMapLocation: (location: Location) => void;
  radius: number;
  setRadius: (radius: number) => void;
  timeRange: number;
  setTimeRange: (hours: number) => void;

  // Reports
  reports: Report[];
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  removeReport: (id: string) => void;

  // Summary
  summary: Summary | null;
  setSummary: (summary: Summary | null) => void;
  summaryLoading: boolean;
  setSummaryLoading: (loading: boolean) => void;
  selectedBulletIndex: number | null;
  setSelectedBulletIndex: (index: number | null) => void;

  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;

  // UI
  reportFormVisible: boolean;
  setReportFormVisible: (visible: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Offline support
  queuedReports: Omit<Report, "id" | "createdAt">[];
  addQueuedReport: (report: Omit<Report, "id" | "createdAt">) => void;
  clearQueuedReports: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  userId: null,
  setUserId: (id: string) => set({ userId: id }),

  // User
  user: null,
  setUser: (user: User | null) => set({ user }),

  // Location
  currentLocation: null,
  setCurrentLocation: (location: Location) => set({ currentLocation: location }),

  // Map
  mapLocation: null,
  setMapLocation: (location: Location) => set({ mapLocation: location }),
  radius: 5,
  setRadius: (radius: number) => set({ radius }),
  timeRange: 24,
  setTimeRange: (hours: number) => set({ timeRange: hours }),

  // Reports
  reports: [],
  setReports: (reports: Report[]) => set({ reports }),
  addReport: (report: Report) => set((state) => ({ reports: [report, ...state.reports] })),
  removeReport: (id: string) =>
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),

  // Summary
  summary: null,
  setSummary: (summary: Summary | null) => set({ summary }),
  summaryLoading: false,
  setSummaryLoading: (loading: boolean) => set({ summaryLoading: loading }),
  selectedBulletIndex: null,
  setSelectedBulletIndex: (index: number | null) => set({ selectedBulletIndex: index }),

  // Onboarding
  onboardingCompleted: false,
  setOnboardingCompleted: (completed: boolean) => {
    set({ onboardingCompleted: completed });
    AsyncStorage.setItem("onboardingCompleted", JSON.stringify(completed));
  },

  // UI
  reportFormVisible: false,
  setReportFormVisible: (visible: boolean) => set({ reportFormVisible: visible }),
  darkMode: true,
  setDarkMode: (dark: boolean) => {
    set({ darkMode: dark });
    AsyncStorage.setItem("darkMode", JSON.stringify(dark));
  },

  // Offline
  queuedReports: [],
  addQueuedReport: (report: Omit<Report, "id" | "createdAt">) =>
    set((state) => ({ queuedReports: [...state.queuedReports, report] })),
  clearQueuedReports: () => set({ queuedReports: [] }),
}));

// Initialize store from AsyncStorage
export async function initializeStore() {
  try {
    const onboarding = await AsyncStorage.getItem("onboardingCompleted");
    const darkMode = await AsyncStorage.getItem("darkMode");

    if (onboarding !== null) {
      useAppStore.setState({ onboardingCompleted: JSON.parse(onboarding) });
    }
    if (darkMode !== null) {
      useAppStore.setState({ darkMode: JSON.parse(darkMode) });
    }
  } catch (error) {
    console.error("Failed to initialize store:", error);
  }
}
