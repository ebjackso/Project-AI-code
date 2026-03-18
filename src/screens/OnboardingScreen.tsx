import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useAppStore } from "@/store";
import { Text, Button } from "@components/UI";
import { SafeContainer, Column, Row, Spacer } from "@components/Layout";
import { ONBOARDING_SLIDES } from "@utils/constants";

export function OnboardingScreen() {
  const { setOnboardingCompleted } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      setOnboardingCompleted(true);
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted(true);
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <SafeContainer testID="onboarding-screen" className="bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Skip button */}
        <Row className="justify-end mb-8">
          <Pressable onPress={handleSkip}>
            <Text color="primary" className="text-sm font-semibold">
              Skip →
            </Text>
          </Pressable>
        </Row>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {/* Icon/Emoji */}
          <Text className="text-9xl mb-8">{slide.icon}</Text>

          {/* Title */}
          <Text variant="h1" className="text-center mb-4 leading-tight">
            {slide.title}
          </Text>

          {/* Description */}
          <Text
            color="textSecondary"
            variant="body"
            className="text-center mb-12 leading-relaxed px-4"
          >
            {slide.description}
          </Text>

          {/* Indicators */}
          <Row className="gap-2 justify-center mb-12">
            {ONBOARDING_SLIDES.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentSlide ? "bg-blue-500 w-8" : "bg-slate-700 w-2"
                }`}
              />
            ))}
          </Row>
        </View>

        <Spacer height={40} />
      </ScrollView>

      {/* Navigation buttons */}
      <Row className="gap-3 pt-6 border-t border-slate-700">
        <Button
          onPress={handlePrevious}
          variant="outline"
          disabled={currentSlide === 0}
          style={{ flex: 1 }}
        >
          Previous
        </Button>
        <Button onPress={handleNext} style={{ flex: 1 }}>
          {isLastSlide ? "Get Started" : "Next"}
        </Button>
      </Row>
    </SafeContainer>
  );
}
