import axios from "axios";
import { SummaryRequest, SummaryResponse } from "@types";

const CLOUD_FUNCTIONS_URL = process.env.EXPO_PUBLIC_CLOUD_FUNCTIONS_URL;

const apiClient = axios.create({
  baseURL: CLOUD_FUNCTIONS_URL,
  timeout: 30000,
});

export async function generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
  try {
    const response = await apiClient.post("/generateSummary", request, {
      params: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function moderateReport(text: string): Promise<{ approved: boolean; reason?: string }> {
  try {
    const response = await apiClient.post("/moderateReport", { text }, {
      params: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Moderation check failed:", error);
    // Default to approval on error to avoid blocking users
    return { approved: true };
  }
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const response = await apiClient.post("/checkRateLimit", { userId }, {
      params: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      },
    });
    return response.data.allowed;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Default to allowing on error
    return true;
  }
}

export async function reportIncident(reportId: string, reason: string): Promise<boolean> {
  try {
    const response = await apiClient.post("/reportIncident", { reportId, reason }, {
      params: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      },
    });
    return response.data.success;
  } catch (error) {
    console.error("Failed to report incident:", error);
    return false;
  }
}

// Health check for Cloud Functions
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await apiClient.get("/health");
    return response.status === 200;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}
