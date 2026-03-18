import React, { useState, useEffect } from "react";
import { View, Switch, ScrollView } from "react-native";
import * as Notifications from "expo-notifications";
import { useAppStore } from "@/store";
import * as firebaseService from "@services/firebase";
import { Text, Button } from "@components/UI";
import { SafeContainer, Card, Row, Column, Spacer, Divider } from "@components/Layout";

export function AlertsScreen() {
  const { userId, user, setUser } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences.enableNotifications ?? false
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === "granted";
      } catch (error) {
        console.error("Notification permission failed:", error);
        return false;
      }
    };

    if (notificationsEnabled && !user?.preferences.enableNotifications) {
      requestNotificationPermissions();
    }
  }, [notificationsEnabled]);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!userId) return;

    setLoading(true);
    try {
      const updatedPreferences = {
        ...user?.preferences,
        enableNotifications: enabled,
      };

      await firebaseService.createOrUpdateUser(userId, updatedPreferences);

      if (user) {
        setUser({ ...user, preferences: updatedPreferences });
      }

      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error("Failed to update notification preference:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeContainer testID="alerts-screen" className="bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Column className="mb-8">
          <Text variant="h1" className="mb-2">
            Alerts & Notifications
          </Text>
          <Text color="textSecondary">Customize how you receive updates</Text>
        </Column>

        {/* Notification toggles */}
        <Card className="mb-6">
          <Column className="gap-4">
            <Row className="justify-between">
              <Column style={{ flex: 1 }}>
                <Text className="font-semibold mb-1">Push Notifications</Text>
                <Text color="textSecondary" variant="small">
                  Get notified when new summaries are generated in your area.
                </Text>
              </Column>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                disabled={loading}
                trackColor={{ false: "#475569", true: "#3B82F6" }}
                thumbColor={notificationsEnabled ? "#0EA5E9" : "#94a3b8"}
              />
            </Row>
          </Column>
        </Card>

        {/* Notification frequency */}
        <Card className="mb-6">
          <Column>
            <Text className="font-semibold mb-4">Notification Frequency</Text>

            <NotificationOption
              title="Real-time"
              description="Instant notifications for every new summary"
              selected={true}
            />
            <Spacer height={16} />
            <NotificationOption
              title="Hourly Digest"
              description="One summary per hour with all updates"
              selected={false}
              disabled={true}
            />
            <Spacer height={16} />
            <NotificationOption
              title="Daily Digest"
              description="One summary per day in the morning"
              selected={false}
              disabled={true}
            />

            <Text color="textSecondary" variant="caption" className="mt-4 italic">
              Additional frequency options coming soon.
            </Text>
          </Column>
        </Card>

        {/* Notification radius */}
        <Card className="mb-6">
          <Column>
            <Text className="font-semibold mb-4">Notification Radius</Text>
            <Text color="textSecondary" variant="small" className="mb-4">
              Receive alerts for summaries within this distance from your saved locations.
            </Text>

            <Row className="gap-2 flex-wrap">
              {[1, 3, 5, 10].map((km) => (
                <Button
                  key={km}
                  variant={km === 5 ? "primary" : "outline"}
                  size="sm"
                  disabled={true}
                >
                  {km}km
                </Button>
              ))}
            </Row>
            <Text color="textSecondary" variant="caption" className="mt-4 italic">
              Customization coming in a future update.
            </Text>
          </Column>
        </Card>

        {/* Privacy & Help */}
        <Card className="mb-6 bg-blue-900/20 border-blue-700">
          <Column>
            <Text className="font-semibold mb-2">🔒 Your Privacy</Text>
            <Text color="textSecondary" variant="small">
              We never track your exact location. Notifications are based on regions you choose to follow, not your
              precise coordinates.
            </Text>
          </Column>
        </Card>

        {/* Troubleshooting */}
        <Column className="mb-8">
          <Text variant="h3" className="mb-4">
            Troubleshooting
          </Text>

          <Card className="mb-3">
            <Column>
              <Text className="font-semibold mb-2">Notifications not showing?</Text>
              <Text color="textSecondary" variant="small">
                1. Check your device notification settings
              </Text>
              <Text color="textSecondary" variant="small">
                2. Ensure LocalPulse has notification permissions
              </Text>
              <Text color="textSecondary" variant="small">
                3. Toggle notifications off and on again
              </Text>
            </Column>
          </Card>

          <Button variant="outline">📧 Contact Support</Button>
        </Column>

        <Spacer height={20} />
      </ScrollView>
    </SafeContainer>
  );
}

function NotificationOption({
  title,
  description,
  selected,
  disabled = false,
}: {
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable disabled={disabled} className={disabled ? "opacity-50" : ""}>
      <Row className="justify-between items-center">
        <Column style={{ flex: 1 }}>
          <Text className={`font-semibold mb-1 ${disabled ? "text-slate-500" : ""}`}>
            {title}
          </Text>
          <Text
            color={disabled ? "textSecondary" : "textSecondary"}
            variant="small"
            className={disabled ? "line-through" : ""}
          >
            {description}
          </Text>
        </Column>
        <View
          className={`w-6 h-6 rounded border-2 ml-2 flex items-center justify-center ${
            selected ? "bg-blue-500 border-blue-500" : "border-slate-600"
          }`}
        >
          {selected && <Text className="text-white font-bold">✓</Text>}
        </View>
      </Row>
    </Pressable>
  );
}

import { Pressable } from "react-native";
