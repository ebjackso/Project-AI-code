import { initializeApp } from "firebase/app";
import { getAuth, signAnonymously, Auth } from "firebase/auth";
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  GeoPoint,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Report, Summary, User } from "@types";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Sign in anonymously on app start
export async function initializeAuth(): Promise<string> {
  try {
    const result = await signAnonymously(auth);
    return result.user.uid;
  } catch (error) {
    console.error("Auth initialization failed:", error);
    throw error;
  }
}

// Report operations
export async function submitReport(report: Omit<Report, "id" | "createdAt">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      ...report,
      location: new GeoPoint(report.location.latitude, report.location.longitude),
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiration
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to submit report:", error);
    throw error;
  }
}

export async function getUserReports(userId: string): Promise<Report[]> {
  try {
    const q = query(
      collection(db, "reports"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        },
      } as Report;
    });
  } catch (error) {
    console.error("Failed to fetch user reports:", error);
    return [];
  }
}

export async function updateReport(reportId: string, updates: Partial<Report>): Promise<void> {
  try {
    await updateDoc(doc(db, "reports", reportId), updates);
  } catch (error) {
    console.error("Failed to update report:", error);
    throw error;
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "reports", reportId));
  } catch (error) {
    console.error("Failed to delete report:", error);
    throw error;
  }
}

export async function getReportsInRadius(
  latitude: number,
  longitude: number,
  radiusKm: number,
  hoursBack: number
): Promise<Report[]> {
  try {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const q = query(
      collection(db, "reports"),
      where("createdAt", ">=", cutoffTime),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    // Filter by distance (Firestore doesn't support geo queries without Geofire library)
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          location: {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          },
        } as Report;
      })
      .filter((report) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          report.location.latitude,
          report.location.longitude
        );
        return distance <= radiusKm;
      });
  } catch (error) {
    console.error("Failed to fetch reports in radius:", error);
    return [];
  }
}

// User operations
export async function createOrUpdateUser(userId: string, preferences: any): Promise<void> {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    return { id: userId, ...userDoc.data() } as User;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

// Photo upload
export async function uploadReportPhoto(userId: string, reportId: string, photoUri: string): Promise<string> {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const photoRef = ref(storage, `reports/${userId}/${reportId}/photo.jpg`);
    await uploadBytes(photoRef, blob);
    const url = await getDownloadURL(photoRef);
    return url;
  } catch (error) {
    console.error("Failed to upload photo:", error);
    throw error;
  }
}

// Summary operations
export async function saveSummary(summary: Summary): Promise<void> {
  try {
    const summaryRef = doc(db, "summaries", `${summary.location.latitude}_${summary.location.longitude}_${summary.radius}`);
    await setDoc(summaryRef, summary);
  } catch (error) {
    console.error("Failed to save summary:", error);
    throw error;
  }
}

export async function getSummary(latitude: number, longitude: number, radiusKm: number): Promise<Summary | null> {
  try {
    const summaryRef = doc(db, "summaries", `${latitude}_${longitude}_${radiusKm}`);
    const summaryDoc = await getDoc(summaryRef);
    if (!summaryDoc.exists()) return null;
    return summaryDoc.data() as Summary;
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return null;
  }
}

// Helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

export { auth, db, storage };
