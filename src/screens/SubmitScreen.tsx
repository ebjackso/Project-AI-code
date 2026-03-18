import React, { useState, useCallback } from "react";
import { ScrollView, View, Pressable, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAppStore } from "@/store";
import * as firebaseService from "@services/firebase";
import { validateReport, REPORT_CATEGORIES, REPORT_MAX_LENGTH } from "@utils/constants";
import { Text, Button } from "@components/UI";
import { SafeContainer, Column, Row, Spacer, Divider } from "@components/Layout";
import { Report, ReportCategory } from "@types";

export function SubmitScreen() {
  const { currentLocation, userId, addReport } = useAppStore();
  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("Other");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = useCallback(async () => {
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
      const report: Omit<Report, "id" | "createdAt"> = {
        userId,
        text,
        location: currentLocation,
        timestamp: Date.now(),
        category: selectedCategory,
        customTags: [],
        isAnonymous: true,
        upvotes: 0,
      };

      let photoUrl: string | undefined;
      if (photoUri) {
        const tempId = `temp_${Date.now()}`;
        photoUrl = await firebaseService.uploadReportPhoto(userId, tempId, photoUri);
        report.photoUrl = photoUrl;
      }

      const reportId = await firebaseService.submitReport(report);

      const newReport: Report = {
        ...report,
        id: reportId,
        createdAt: new Date(),
      };
      addReport(newReport);

      setSuccess(true);
      setText("");
      setPhotoUri(null);
      setSelectedCategory("Other");

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }, [text, currentLocation, userId, selectedCategory, photoUri, addReport]);

  return (
    <SafeContainer testID="submit-screen" className="bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <Column className="mb-8">
          <Text variant="h1" className="mb-2">
            Share an Update
          </Text>
          <Text color="textSecondary">
            Help your community by reporting what's happening right now
          </Text>
        </Column>

        {/* Success message */}
        {success && (
          <View className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 mb-6">
            <Text color="secondary" className="font-semibold mb-1">
              ✓ Report Submitted!
            </Text>
            <Text color="textSecondary" variant="small">
              Your report is now included in summaries within 24 hours.
            </Text>
          </View>
        )}

        {/* Text input */}
        <Column className="mb-6">
          <Text variant="small" color="textSecondary" className="mb-3 font-semibold">
            What's Happening? ({text.length} / {REPORT_MAX_LENGTH})
          </Text>
          <View className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-4 min-h-48">
            <Text
              className="text-slate-100 text-base"
              value={text}
              onChangeText={setText}
              placeholder="Describe the situation in your area. Be specific and helpful..."
              placeholderTextColor="#64748b"
              multiline={true}
              numberOfLines={10}
            />
          </View>
          <Text color="textSecondary" variant="caption" className="mt-2">
            Minimum 10 characters. Maximum {REPORT_MAX_LENGTH} characters.
          </Text>
        </Column>

        {/* Category */}
        <Column className="mb-6">
          <Text variant="small" color="textSecondary" className="mb-3 font-semibold">
            Choose a Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {REPORT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-3 rounded-lg border transition-all ${
                  selectedCategory === category
                    ? "bg-blue-500/30 border-blue-500"
                    : "bg-slate-800 border-slate-700"
                }`}
              >
                <Text
                  variant="small"
                  color={selectedCategory === category ? "primary" : "textSecondary"}
                  className="font-semibold"
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </Column>

        {/* Photo */}
        <Column className="mb-6">
          <Text variant="small" color="textSecondary" className="mb-3 font-semibold">
            Add a Photo (Optional)
          </Text>
          <Button onPress={handleAddPhoto} variant="outline">
            📷 {photoUri ? "Change Photo" : "Add Photo"}
          </Button>

          {photoUri && (
            <View className="mt-4 rounded-lg overflow-hidden border border-slate-700 relative">
              <Image source={{ uri: photoUri }} style={{ width: "100%", height: 250 }} />
              <Pressable
                onPress={() => setPhotoUri(null)}
                className="absolute top-3 right-3 bg-black/70 rounded-full p-2"
              >
                <Text className="text-white text-lg">✕</Text>
              </Pressable>
            </View>
          )}
        </Column>

        {/* Location info */}
        <Column className="mb-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
          <Text variant="small" color="textSecondary" className="mb-2 font-semibold">
            Your Location
          </Text>
          <Text className="text-base">{currentLocation?.address || "Obtaining location..."}</Text>
          <Text color="textSecondary" variant="caption" className="mt-2">
            This helps us include your report in the right area's summary.
          </Text>
        </Column>

        {/* Privacy note */}
        <View className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
          <Text variant="small" className="font-semibold mb-1">
            🔒 Privacy First
          </Text>
          <Text color="textSecondary" variant="small">
            Your report is anonymous. Your exact location is kept private and only used to find reports in your area.
          </Text>
        </View>

        {/* Error message */}
        {error && (
          <View className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <Text color="danger" className="font-semibold">
              ⚠ Error
            </Text>
            <Text color="danger" variant="small" className="mt-1">
              {error}
            </Text>
          </View>
        )}

        <Spacer height={24} />
      </ScrollView>

      {/* Submit button */}
      <Button
        onPress={handleSubmit}
        loading={loading}
        disabled={!text.trim() || !currentLocation}
        size="lg"
        className="mb-4"
      >
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </SafeContainer>
  );
}
