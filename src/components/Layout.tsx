import React, { ReactNode } from "react";
import { View, ViewStyle } from "react-native";

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
  testID?: string;
}

export function Container({ children, className = "", testID }: ContainerProps) {
  return (
    <View className={`flex-1 bg-slate-900 ${className}`} testID={testID}>
      {children}
    </View>
  );
}

export function SafeContainer({ children, className = "", testID }: ContainerProps) {
  return (
    <View
      className={`flex-1 bg-slate-900 pt-safe pb-safe px-4 ${className}`}
      testID={testID}
    >
      {children}
    </View>
  );
}

export function Card({ children, className = "" }: ContainerProps) {
  return (
    <View className={`bg-slate-800 rounded-lg p-4 border border-slate-700 ${className}`}>
      {children}
    </View>
  );
}

interface RowProps {
  children: ReactNode;
  className?: string;
}

export function Row({ children, className = "" }: RowProps) {
  return <View className={`flex-row items-center ${className}`}>{children}</View>;
}

export function Column({ children, className = "" }: RowProps) {
  return <View className={`flex-col ${className}`}>{children}</View>;
}

export function Spacer({ height = 4 }: { height?: number }) {
  return <View style={{ height }} />;
}

export function Divider({ className = "" }: { className?: string }) {
  return <View className={`h-px bg-slate-700 ${className}`} />;
}
