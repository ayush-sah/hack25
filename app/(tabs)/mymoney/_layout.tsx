import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ExpenseTrackerProvider } from '../../src/context/ExpenseTrackerContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ExpenseTrackerProvider>
      <Tabs
        initialRouteName="news"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        {/* Remove Home tab */}
        {/* <Tabs.Screen
        name="index"
        options={{
          title: "Home",
@@ -30,70 +26,67 @@
            />
          ),
        }}
      /> */}
        <Tabs.Screen
          name="mymoney"
          options={{
            title: "My Money",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "wallet" : "wallet-outline"}
                color={color}
              />
            ),
            headerShown: false, // We'll handle header inside nested tabs
          }}
        />

        <Tabs.Screen
          name="chatbot"
          options={{
            title: "ChatBot",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "laptop" : "laptop-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: "News",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "newspaper" : "newspaper-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="trivia"
          options={{
            title: "Trivia",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "game-controller" : "game-controller-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="simulator"
          options={{
            title: "Simulator",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "trending-up" : "trending-up-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </ExpenseTrackerProvider>
  );
}