import React, { useEffect, useState } from "react";
import { Stack, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAppStore, initializeStore } from "@/store";
import { initializeAuth } from "@services/firebase";
import { requestLocationPermission } from "@services/location";
import { MapScreen } from "@screens/MapScreen";
import { SubmitScreen } from "@screens/SubmitScreen";
import { MyReportsScreen } from "@screens/MyReportsScreen";
import { AlertsScreen } from "@screens/AlertsScreen";
import { OnboardingScreen } from "@screens/OnboardingScreen";

export default function RootLayout() {
  const { userId, setUserId, onboardingCompleted } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Zustand store from AsyncStorage
        await initializeStore();

        // Initialize Firebase auth
        const uid = await initializeAuth();
        setUserId(uid);

        // Request location permissions
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarLabel: "Map",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            // Navigate to map screen
          },
        })}
      />

      <Tabs.Screen
        name="submit"
        options={{
          title: "Submit",
          tabBarLabel: "Submit",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text>,
        }}
      />

      <Tabs.Screen
        name="my-reports"
        options={{
          title: "My Reports",
          tabBarLabel: "My Reports",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔔</Text>,
        }}
      />
    </Tabs>
  );
}

// Placeholder for Text (should come from UI.tsx)
function Text({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={style}>{children}</View>;
}
