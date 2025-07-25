import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "System",
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "System",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 32,
    fontFamily: "System",
    fontWeight: "bold",
    lineHeight: 36,
    color: "#00B6F0",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "System",
    fontWeight: "bold",
    color: "#003B5C",
    letterSpacing: 0.2,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#00B6F0",
    fontWeight: "600",
    textDecorationLine: "underline",
    letterSpacing: 0.1,
  },
});
