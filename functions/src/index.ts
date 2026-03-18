import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import axios from "axios";
import { generateSummary } from "./summarizer";
import { moderateReport } from "./moderation";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });

// Cloud Function: Generate AI Summary
export const generateSummaryFn = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(400).json({ error: "Method not allowed" });
        }

        const { latitude, longitude, radiusKm, timeRangeHours } = req.body;

        if (!latitude || !longitude || !radiusKm || !timeRangeHours) {
          return res.status(400).json({ error: "Missing required parameters" });
        }

        // Fetch reports within the radius and time range
        const reports = await fetchReportsInRadius(
          latitude,
          longitude,
          radiusKm,
          timeRangeHours
        );

        if (reports.length === 0) {
          return res.status(200).json({
            success: true,
            data: {
              id: `${latitude}_${longitude}_${radiusKm}`,
              location: { latitude, longitude },
              radius: radiusKm,
              headline: "No recent reports in this area",
              bullets: [
                {
                  text: "This location has been quiet recently",
                  reportCount: 0,
                  relatedReportIds: [],
                },
              ],
              reportCount: 0,
              generatedAt: Date.now(),
              lastUpdatedAt: Date.now(),
              timeRange: `${timeRangeHours}h` as const,
            },
          });
        }

        // Generate summary using AI
        const summary = await generateSummary(reports, latitude, longitude, radiusKm);

        // Save summary to Firestore
        await saveSummary(summary);

        return res.status(200).json({
          success: true,
          data: summary,
        });
      } catch (error) {
        console.error("Error generating summary:", error);
        return res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
  }
);

// Cloud Function: Moderate Report
export const moderateReportFn = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(400).json({ error: "Method not allowed" });
        }

        const { text } = req.body;

        if (!text) {
          return res.status(400).json({ error: "Missing text" });
        }

        const result = await moderateReport(text);

        return res.status(200).json(result);
      } catch (error) {
        console.error("Error in moderation:", error);
        return res.status(500).json({
          approved: true, // Default to approval on error
          reason: "Moderation service unavailable",
        });
      }
    });
  }
);

// Cloud Function: Check Rate Limit
export const checkRateLimitFn = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(400).json({ error: "Method not allowed" });
        }

        const { userId } = req.body;

        if (!userId) {
          return res.status(400).json({ error: "Missing userId" });
        }

        const allowed = await checkRateLimit(userId);

        return res.status(200).json({ allowed });
      } catch (error) {
        console.error("Error checking rate limit:", error);
        return res.status(200).json({ allowed: true }); // Default to allowing on error
      }
    });
  }
);

// Cloud Function: Report Incident
export const reportIncidentFn = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(400).json({ error: "Method not allowed" });
        }

        const { reportId, reason } = req.body;

        if (!reportId || !reason) {
          return res.status(400).json({ error: "Missing reportId or reason" });
        }

        // Save incident report
        await db.collection("incidents").add({
          reportId,
          reason,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Error reporting incident:", error);
        return res.status(500).json({ success: false });
      }
    });
  }
);

// Helper function: Fetch reports in radius
async function fetchReportsInRadius(
  latitude: number,
  longitude: number,
  radiusKm: number,
  hoursBack: number
) {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const snapshot = await db
    .collection("reports")
    .where("createdAt", ">=", cutoffTime)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs
    .map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))
    .filter((report: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        report.location.latitude,
        report.location.longitude
      );
      return distance <= radiusKm;
    });
}

// Helper function: Calculate distance
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
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

// Helper function: Save summary
async function saveSummary(summary: any) {
  const summaryRef = db
    .collection("summaries")
    .doc(`${summary.location.latitude}_${summary.location.longitude}_${summary.radius}`);
  await summaryRef.set(summary);
}

// Helper function: Check rate limit
async function checkRateLimit(userId: string): Promise<boolean> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const hourSnapshot = await db
    .collection("reports")
    .where("userId", "==", userId)
    .where("createdAt", ">=", hourAgo)
    .get();

  const daySnapshot = await db
    .collection("reports")
    .where("userId", "==", userId)
    .where("createdAt", ">=", dayAgo)
    .get();

  const maxPerHour = parseInt(process.env.MAX_REPORTS_PER_HOUR || "10");
  const maxPerDay = parseInt(process.env.MAX_REPORTS_PER_DAY || "50");

  return hourSnapshot.size < maxPerHour && daySnapshot.size < maxPerDay;
}

// Health check
export const health = functions.https.onRequest((req, res) => {
  res.status(200).json({ status: "ok" });
});
