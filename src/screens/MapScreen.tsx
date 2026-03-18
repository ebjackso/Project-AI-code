import React, { useEffect, useState } from "react";
import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { useAppStore } from "@/store";
import { useLocation, useSummary, usePullToRefresh } from "@hooks";
import * as apiService from "@services/api";
import { SummaryCard, ReportDetailModal } from "@components/SummaryCard";
import { FloatingActionButton, ReportForm } from "@components/ReportForm";
import { Text, Button } from "@components/UI";
import { SafeContainer, Row, Spacer } from "@components/Layout";
import { RADIUS_OPTIONS } from "@utils/constants";

export function MapScreen() {
  const { currentLocation, setCurrentLocation, mapLocation, setMapLocation, radius, setRadius } =
    useAppStore();
  const { location } = useLocation();
  const { generateSummary, error } = useSummary();
  const { isRefreshing, onRefresh } = usePullToRefresh();
  const { summary, summaryLoading, selectedBulletIndex, setSelectedBulletIndex } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Initialize location
  useEffect(() => {
    if (location) {
      setCurrentLocation(location);
      if (!mapLocation) {
        setMapLocation(location);
      }
    }
  }, [location]);

  // Auto-fetch summary when location or radius changes
  useEffect(() => {
    if (mapLocation) {
      generateSummary();
    }
  }, [mapLocation, radius]);

  // Set up auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (mapLocation) {
        generateSummary();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [mapLocation, generateSummary]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMapLocation({ latitude, longitude });
  };

  const handleRefresh = async () => {
    await onRefresh(generateSummary);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  return (
    <SafeContainer testID="map-screen">
      {/* Map */}
      {currentLocation && mapReady ? (
        <MapView
          style={{ flex: 1, marginBottom: 8 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
          onMapReady={() => setMapReady(true)}
        >
          {/* User location marker */}
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />

          {/* Map location circle and marker */}
          {mapLocation && (
            <>
              <Circle
                center={{
                  latitude: mapLocation.latitude,
                  longitude: mapLocation.longitude,
                }}
                radius={radius * 1000} // Convert km to meters
                strokeColor="rgba(59, 130, 246, 0.5)"
                fillColor="rgba(59, 130, 246, 0.1)"
              />
              <Marker
                coordinate={{
                  latitude: mapLocation.latitude,
                  longitude: mapLocation.longitude,
                }}
                title="Search Location"
                pinColor="green"
              />
            </>
          )}
        </MapView>
      ) : (
        <View style={{ flex: 1 }} className="bg-slate-800 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4">Loading map...</Text>
        </View>
      )}

      {/* Controls */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-slate-800 px-4 py-3 mb-2"
      >
        <Text variant="small" color="textSecondary" className="mr-3 leading-tight pt-2">
          Radius:
        </Text>
        {RADIUS_OPTIONS.map((r) => (
          <Pressable
            key={r}
            onPress={() => handleRadiusChange(r)}
            className={`px-4 py-2 rounded-lg mr-2 ${
              radius === r ? "bg-blue-500" : "bg-slate-700"
            }`}
          >
            <Text color={radius === r ? "text" : "textSecondary"} variant="small">
              {r}km
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Summary Card */}
      <View className="flex-1 mb-2">
        <SummaryCard
          summary={summary}
          onRefresh={handleRefresh}
          loading={summaryLoading || isRefreshing}
          onBulletPress={(index) => {
            useAppStore.setState({ selectedBulletIndex: index });
            setShowDetailModal(true);
          }}
        />
      </View>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setShowForm(true)} />

      {/* Report Form Modal */}
      <ReportForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmitSuccess={() => {
          setShowForm(false);
          handleRefresh();
        }}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        visible={showDetailModal}
        bulletIndex={selectedBulletIndex}
        onClose={() => setShowDetailModal(false)}
      />

      {/* Error display */}
      {error && (
        <View className="bg-red-900/20 border-t border-red-700 px-4 py-2">
          <Text color="danger" variant="small">
            {error}
          </Text>
        </View>
      )}
    </SafeContainer>
  );
}
