import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useAppStore } from "@/store";
import { Text, Button, Card, Badge } from "./UI";
import { Row, Column, Spacer, Divider } from "./Layout";
import { formatTimeAgo } from "@utils/constants";
import { Summary } from "@types";

interface SummaryCardProps {
  summary: Summary | null;
  onRefresh: () => void;
  loading: boolean;
  onBulletPress: (index: number) => void;
}

export function SummaryCard({ summary, onRefresh, loading, onBulletPress }: SummaryCardProps) {
  if (!summary) {
    return (
      <Card className="m-4">
        <Text variant="h3" className="mb-2">
          No Data Available
        </Text>
        <Text color="textSecondary" className="mb-4">
          Move the map or adjust the radius to load reports in that area.
        </Text>
        <Button onPress={onRefresh} loading={loading}>
          Load Summary
        </Button>
      </Card>
    );
  }

  return (
    <Card className="m-4">
      {/* Headline */}
      <Text variant="h2" className="mb-4 leading-tight">
        {summary.headline}
      </Text>

      {/* Report count */}
      <Row className="mb-3">
        <Badge label={`${summary.reportCount} reports`} variant="secondary" />
        <View style={{ flex: 1 }} />
        <Text color="textSecondary" variant="caption">
          {formatTimeAgo(summary.generatedAt)}
        </Text>
      </Row>

      <Divider className="mb-4" />

      {/* Bullets */}
      <ScrollView nestedScrollEnabled={true} className="max-h-64">
        {summary.bullets.map((bullet, index) => (
          <Pressable key={index} onPress={() => onBulletPress(index)} className="mb-3">
            <Row>
              <View className="flex-1">
                <Text className="leading-relaxed">{bullet.text}</Text>
                <Text color="textSecondary" variant="small" className="mt-1">
                  ({bullet.reportCount} {bullet.reportCount === 1 ? "report" : "reports"})
                </Text>
              </View>
              <Text color="primary" className="ml-2">
                &gt;
              </Text>
            </Row>
          </Pressable>
        ))}
      </ScrollView>

      <Spacer height={16} />
      <Divider className="mb-4" />

      {/* Action button */}
      <Button onPress={onRefresh} loading={loading} size="sm" variant="secondary">
        Refresh Summary
      </Button>
    </Card>
  );
}

interface ReportDetailModalProps {
  visible: boolean;
  bulletIndex: number | null;
  onClose: () => void;
}

export function ReportDetailModal({ visible, bulletIndex, onClose }: ReportDetailModalProps) {
  const { summary } = useAppStore();

  if (!visible || bulletIndex === null || !summary) return null;

  const bullet = summary.bullets[bulletIndex];

  return (
    <View className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-h-96">
        <Row className="mb-4">
          <Column style={{ flex: 1 }}>
            <Text variant="h3">{bullet.text}</Text>
          </Column>
          <Pressable onPress={onClose} className="ml-2">
            <Text color="textSecondary" className="text-2xl">
              ✕
            </Text>
          </Pressable>
        </Row>

        <Divider className="mb-4" />

        <ScrollView className="flex-1">
          <Text color="textSecondary" className="mb-2">
            {bullet.reportCount} {bullet.reportCount === 1 ? "report" : "reports"} contributed to this
            summary.
          </Text>
          <Text color="textSecondary" variant="small" className="italic">
            Individual report details are anonymized to protect privacy.
          </Text>
        </ScrollView>

        <Spacer height={16} />
        <Button onPress={onClose} variant="outline">
          Close
        </Button>
      </Card>
    </View>
  );
}
