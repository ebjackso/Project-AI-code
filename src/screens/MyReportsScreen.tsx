import React, { useEffect, useState } from "react";
import { View, FlatList, Pressable, Alert, ActivityIndicator } from "react-native";
import { useAppStore } from "@/store";
import * as firebaseService from "@services/firebase";
import { Text, Button } from "@components/UI";
import { SafeContainer, Card, Row, Column, Spacer, Divider } from "@components/Layout";
import { formatTimeAgo } from "@utils/constants";
import { Report } from "@types";

export function MyReportsScreen() {
  const { userId } = useAppStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;
      try {
        const userReports = await firebaseService.getUserReports(userId);
        setReports(userReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  const handleDelete = (reportId: string) => {
    Alert.alert("Delete Report", "Are you sure you want to delete this report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await firebaseService.deleteReport(reportId);
            setReports((prev) => prev.filter((r) => r.id !== reportId));
          } catch (error) {
            Alert.alert("Error", "Failed to delete report");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeContainer testID="my-reports-screen" className="justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeContainer>
    );
  }

  return (
    <SafeContainer testID="my-reports-screen">
      {/* Header */}
      <Column className="mb-6">
        <Text variant="h1" className="mb-2">
          My Reports
        </Text>
        <Text color="textSecondary">
          {reports.length} {reports.length === 1 ? "report" : "reports"} submitted
        </Text>
      </Column>

      {reports.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text color="textSecondary" className="text-center text-lg mb-4">
            You haven't submitted any reports yet.
          </Text>
          <Text color="textSecondary" variant="small" className="text-center">
            Start by tapping the + button to submit your first report.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={({ item }) => <ReportListItem report={item} onDelete={handleDelete} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Spacer height={12} />}
          nestedScrollEnabled={false}
        />
      )}
    </SafeContainer>
  );
}

function ReportListItem({ report, onDelete }: { report: Report; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Row className="justify-between">
          <Column style={{ flex: 1 }}>
            <View className="flex-row flex-wrap gap-2 mb-2">
              <Text variant="small" color="primary" className="font-semibold">
                {report.category}
              </Text>
              <Text color="textSecondary" variant="small">
                •
              </Text>
              <Text color="textSecondary" variant="small">
                {formatTimeAgo(report.timestamp || Date.now())}
              </Text>
            </View>
            <Text numberOfLines={expanded ? 0 : 2} className="leading-relaxed">
              {report.text}
            </Text>
          </Column>
          <Text color="textSecondary" className="ml-2">
            {expanded ? "▼" : "▶"}
          </Text>
        </Row>
      </Pressable>

      {expanded && (
        <>
          <Divider className="my-3" />
          <Column>
            <Text variant="small" color="textSecondary" className="mb-2">
              Location: {report.location.address || "Anonymous"}
            </Text>
            {report.photoUrl && (
              <>
                <Text variant="small" color="textSecondary" className="mb-2">
                  📷 Photo attached
                </Text>
              </>
            )}
            <Row className="gap-2 mt-3">
              <Button
                onPress={() => onDelete(report.id)}
                variant="danger"
                size="sm"
                style={{ flex: 1 }}
              >
                Delete
              </Button>
            </Row>
          </Column>
        </>
      )}
    </Card>
  );
}
