import * as Location from "expo-location";
import { Location as LocationType } from "@types";

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Location permission request failed:", error);
    return false;
  }
}

export async function getCurrentLocation(): Promise<LocationType | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: formatAddress(address[0]),
    };
  } catch (error) {
    console.error("Failed to get current location:", error);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<LocationType | null> {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length === 0) return null;

    return {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
      address,
    };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length === 0) return null;
    return formatAddress(results[0]);
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
}

function formatAddress(result: any): string {
  const parts = [];
  if (result.name) parts.push(result.name);
  if (result.street && result.streetNumber) {
    parts.push(`${result.streetNumber} ${result.street}`);
  } else if (result.street) {
    parts.push(result.street);
  }
  if (result.city) parts.push(result.city);
  if (result.region && !result.city) parts.push(result.region);

  return parts.join(", ") || "Unknown location";
}

export async function watchLocation(
  callback: (location: LocationType) => void,
  errorCallback?: (error: Error) => void
): Promise<string> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 50,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );

    return subscription.remove.toString();
  } catch (error) {
    if (errorCallback) errorCallback(error as Error);
    throw error;
  }
}
