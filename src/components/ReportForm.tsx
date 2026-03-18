import React, { useState, useCallback } from "react";
import { View, ScrollView, Image, Pressable, Modal, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAppStore } from "@/store";
import * as firebaseService from "@services/firebase";
import { validateReport, REPORT_CATEGORIES, REPORT_MIN_LENGTH, REPORT_MAX_LENGTH } from "@utils/constants";
import { Text, Button, Badge } from "./UI";
import { Card, SafeContainer, Row, Column, Spacer, Divider } from "./Layout";
import { Report, ReportCategory } from "@types";

interface ReportFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function ReportForm({ visible, onClose, onSubmitSuccess }: ReportFormProps) {
  const { currentLocation, userId, addReport } = useAppStore();
  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("Other");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  }, []);

  const handleAddTag = useCallback((tag: string) => {
    setCustomTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate
    const validation = validateReport(text);
    if (!validation.valid) {
      setError(validation.error || "Invalid report");
      return;
    }

    if (!currentLocation) {
      setError("Location required");
      return;
    }

    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create report object
      const report: Omit<Report, "id" | "createdAt"> = {
        userId,
        text,
        location: currentLocation,
        timestamp: Date.now(),
        category: selectedCategory,
        customTags,
        isAnonymous: true,
        upvotes: 0,
      };

      // Upload photo if present
      let photoUrl: string | undefined;
      if (photoUri) {
        // Generate a temporary ID for the report (will be replaced by Firebase)
        const tempId = `temp_${Date.now()}`;
        photoUrl = await firebaseService.uploadReportPhoto(userId, tempId, photoUri);
        report.photoUrl = photoUrl;
      }

      // Submit to Firebase
      const reportId = await firebaseService.submitReport(report);

      // Add to local store
      const newReport: Report = {
        ...report,
        id: reportId,
        createdAt: new Date(),
      };
      addReport(newReport);

      // Success
      setPhotoUri(null);
      setText("");
      setCustomTags([]);
      setSelectedCategory("Other");
      onSubmitSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }, [text, currentLocation, userId, selectedCategory, customTags, photoUri, addReport, onSubmitSuccess]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <SafeContainer className="bg-slate-950">
        {/* Header */}
        <Row className="mb-6 justify-between">
          <Text variant="h2">Report an Update</Text>
          <Pressable onPress={onClose}>
            <Text color="textSecondary" className="text-2xl">
              ✕
            </Text>
          </Pressable>
        </Row>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Text input */}
          <Text variant="small" color="textSecondary" className="mb-2">
            Description ({text.length} / {REPORT_MAX_LENGTH})
          </Text>
          <View className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 min-h-32 mb-4">
            <Text
              className="text-slate-100 text-base"
              value={text}
              onChangeText={setText}
              placeholder="What's happening in your area?"
              placeholderTextColor="#64748b"
              multiline={true}
              numberOfLines={6}
            />
          </View>

          {/* Category */}
          <Text variant="small" color="textSecondary" className="mb-2">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {REPORT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedCategory === category
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-slate-800 border-slate-700"
                }`}
              >
                <Text
                  variant="small"
                  color={selectedCategory === category ? "primary" : "textSecondary"}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Photo */}
          <Text variant="small" color="textSecondary" className="mb-2">
            Photo (optional)
          </Text>
          <Button onPress={handleAddPhoto} variant="outline" className="mb-4">
            {photoUri ? "📷 Photo Added" : "📷 Add Photo"}
          </Button>

          {photoUri && (
            <View className="mb-4 rounded-lg overflow-hidden border border-slate-700">
              <Image source={{ uri: photoUri }} style={{ width: "100%", height: 200 }} />
              <Pressable
                onPress={() => setPhotoUri(null)}
                className="absolute top-2 right-2 bg-black/70 rounded-full p-2"
              >
                <Text className="text-white">✕</Text>
              </Pressable>
            </View>
          )}

          {/* Location info */}
          <Card className="mb-6">
            <Text variant="small" color="textSecondary" className="mb-2">
              Location
            </Text>
            <Text>{currentLocation?.address || "Location: Obtaining..."}</Text>
          </Card>

          {/* Error message */}
          {error && (
            <View className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
              <Text color="danger">{error}</Text>
            </View>
          )}

          {/* Help text */}
          <Text variant="caption" color="textSecondary" className="mb-6 italic">
            Your report is anonymous and will be included in AI summaries for your area.
          </Text>
        </ScrollView>

        {/* Submit button */}
        <Row className="gap-3">
          <Button onPress={onClose} variant="outline" style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            disabled={!text.trim() || !currentLocation}
            style={{ flex: 1 }}
          >
            Submit Report
          </Button>
        </Row>
      </SafeContainer>
    </Modal>
  );
}

// Floating action button
export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-28 right-6 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg active:bg-blue-600"
    >
      <Text className="text-white text-3xl">+</Text>
    </Pressable>
  );
}
