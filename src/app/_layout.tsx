import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAppStore, initializeStore } from "@/store";
import { initializeAuth } from "@services/firebase";
import { requestLocationPermission } from "@services/location";
import { OnboardingScreen } from "@screens/OnboardingScreen";

export default function RootLayout() {
  const { userId, setUserId, onboardingCompleted } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeStore();
        const uid = await initializeAuth();
        setUserId(uid);
        await requestLocationPermission();
        setLoading(false);
      } catch (error) {
        console.error("App initialization failed:", error);
        setLoading(false);
      }
    };

    initializeApp();
  }, [setUserId]);

  if (loading || !userId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!onboardingCompleted) {
    return <OnboardingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
