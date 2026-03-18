import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store";
import * as locationService from "@services/location";
import * as apiService from "@services/api";
import { Location } from "@types";

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLocation = async () => {
      try {
        const loc = await locationService.getCurrentLocation();
        setLocation(loc);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get location");
      } finally {
        setLoading(false);
      }
    };

    initLocation();
  }, []);

  const updateLocation = useCallback(async (lat: number, lon: number) => {
    const address = await locationService.reverseGeocode(lat, lon);
    const newLocation: Location = { latitude: lat, longitude: lon, address: address || undefined };
    setLocation(newLocation);
    return newLocation;
  }, []);

  return { location, error, loading, updateLocation };
}

export function useSummary() {
  const { mapLocation, radius, timeRange, summaryLoading, setSummaryLoading } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const generateSummary = useCallback(async () => {
    if (!mapLocation) return;

    setSummaryLoading(true);
    setError(null);

    try {
      const result = await apiService.generateSummary({
        latitude: mapLocation.latitude,
        longitude: mapLocation.longitude,
        radiusKm: radius,
        timeRangeHours: timeRange,
      });

      if (result.success && result.data) {
        useAppStore.setState({ summary: result.data });
        setLastUpdated(Date.now());
      } else {
        setError(result.error || "Failed to generate summary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSummaryLoading(false);
    }
  }, [mapLocation, radius, timeRange, setSummaryLoading]);

  return { generateSummary, error, lastUpdated };
}

export function useAutoRefresh(intervalMs: number = 120000) {
  const { generateSummary } = useSummary();

  useEffect(() => {
    const interval = setInterval(() => {
      generateSummary();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [generateSummary, intervalMs]);
}

export function useRateLimit() {
  const { userId } = useAppStore();
  const [canSubmit, setCanSubmit] = useState(true);
  const [remainingReports, setRemainingReports] = useState<number | null>(null);

  const checkLimit = useCallback(async () => {
    if (!userId) return;

    const allowed = await apiService.checkRateLimit(userId);
    setCanSubmit(allowed);
  }, [userId]);

  return { canSubmit, remainingReports, checkLimit };
}

export function useDebounce(callback: () => void, delay: number = 500) {
  useEffect(() => {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  }, [callback, delay]);
}

export function usePullToRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async (refreshCallback: () => Promise<void>) => {
    setIsRefreshing(true);
    try {
      await refreshCallback();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { isRefreshing, onRefresh };
}

export function useOfflineQueue() {
  const { queuedReports, clearQueuedReports, addQueuedReport } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncQueue = useCallback(async (submitReportFn: (report: any) => Promise<void>) => {
    if (queuedReports.length === 0) return;

    setIsSyncing(true);
    try {
      for (const report of queuedReports) {
        await submitReportFn(report);
      }
      clearQueuedReports();
    } catch (error) {
      console.error("Failed to sync offline queue:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [queuedReports, clearQueuedReports]);

  return { queuedReports, syncQueue, isSyncing, addQueuedReport };
}
