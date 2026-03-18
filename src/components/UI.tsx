import React, { ReactNode } from "react";
import { Text as RNText, TextProps as RNTextProps, Pressable, PressableProps } from "react-native";

interface TextProps extends RNTextProps {
  children: ReactNode;
  className?: string;
  variant?: "h1" | "h2" | "h3" | "body" | "small" | "caption";
  color?: "primary" | "secondary" | "danger" | "warning" | "text" | "textSecondary";
}

const variantClasses = {
  h1: "text-3xl font-bold",
  h2: "text-2xl font-bold",
  h3: "text-xl font-semibold",
  body: "text-base font-normal",
  small: "text-sm font-normal",
  caption: "text-xs font-normal",
};

const colorClasses = {
  primary: "text-blue-500",
  secondary: "text-emerald-500",
  danger: "text-red-500",
  warning: "text-amber-500",
  text: "text-slate-100",
  textSecondary: "text-slate-400",
};

export function Text({
  children,
  className = "",
  variant = "body",
  color = "text",
  ...props
}: TextProps) {
  return (
    <RNText
      className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

interface ButtonProps extends PressableProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
}

const buttonVariantClasses = {
  primary: "bg-blue-500 active:bg-blue-600",
  secondary: "bg-emerald-500 active:bg-emerald-600",
  danger: "bg-red-500 active:bg-red-600",
  outline: "bg-transparent border border-slate-600 active:bg-slate-800",
};

const buttonSizeClasses = {
  sm: "px-3 py-2 rounded",
  md: "px-4 py-3 rounded-lg",
  lg: "px-6 py-4 rounded-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-center ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <Text color={variant === "outline" ? "text" : undefined} className="font-semibold">
        {loading ? "Loading..." : children}
      </Text>
    </Pressable>
  );
}

interface InputProps extends RNTextProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  className = "",
  ...props
}: InputProps) {
  return (
    <RNText
      className={`bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-4 py-3 ${className}`}
      placeholderTextColor="#94a3b8"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      {...props}
    />
  );
}

interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
}

export function Badge({ label, variant = "primary", className = "" }: BadgeProps) {
  const variantBg = {
    primary: "bg-blue-900/50",
    secondary: "bg-slate-700",
    success: "bg-emerald-900/50",
    danger: "bg-red-900/50",
  };

  return (
    <Text
      className={`text-xs font-semibold px-2 py-1 rounded ${variantBg[variant]} ${className}`}
      color={variant === "secondary" ? "textSecondary" : "text"}
    >
      {label}
    </Text>
  );
}
