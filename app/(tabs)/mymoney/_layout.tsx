import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';

export default function MyMoneyLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          switch (route.name) {
            case 'records':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'analysis':
              iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              break;
            case 'budgets':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'accounts':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'categories':
              iconName = focused ? 'albums' : 'albums-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
        }}
      />
    </Tabs>
  );
}
