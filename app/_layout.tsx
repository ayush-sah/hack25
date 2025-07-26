import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/context/context";
import LoginScreen from "@/components/login";
import RegistrationScreen from "@/components/Registration";
import { ExpenseTrackerProvider } from "./src/context/ExpenseTrackerContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ExpenseTrackerProvider>
          <RootLayout2 />
        </ExpenseTrackerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
``;
function RootLayout2() {
  const { isAuthenticated, register } = useAuth();

  return (
    <>
      {register && !isAuthenticated ? <RegistrationScreen navigation={undefined} /> : null}
      {!isAuthenticated && !register ? (
        <>
          <LoginScreen navigation={undefined} />
        </>
      ) : isAuthenticated && register ? (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      ): null}
    </>
  );
}
