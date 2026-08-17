import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { navigationRef } from '../utils/navigation';

import DashboardScreen from '../screens/DashboardScreen';
import MenuScreen from '../screens/MenuScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import GalleryScreen from '../screens/GalleryScreen';
import MoreScreen from '../screens/MoreScreen';
import QRScreen from '../screens/QRScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ContactScreen from '../screens/ContactScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MenuPreviewScreen from '../screens/MenuPreviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.cardBorder,
    primary: colors.accent,
  },
};

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.bg },
};

const tabIconNames: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  Menu: 'restaurant',
  Categories: 'folder',
  Gallery: 'images',
  More: 'ellipsis-horizontal',
};

const tabIconNamesOutline: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home-outline',
  Menu: 'restaurant-outline',
  Categories: 'folder-outline',
  Gallery: 'images-outline',
  More: 'ellipsis-horizontal-outline',
};

function MoreStack({ onLogout }: { onLogout: () => void }) {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MoreHome" options={{ title: 'More' }}>
        {() => <MoreScreen onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="QRCode" component={QRScreen} options={{ title: 'QR Code' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Messages' }} />
      <Stack.Screen name="MenuPreview" component={MenuPreviewScreen} options={{ title: 'Menu Preview' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' as const },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.cardBorder,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tabIconNames[route.name] : tabIconNamesOutline[route.name]}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu Items' }} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
        <Tab.Screen name="Gallery" component={GalleryScreen} />
        <Tab.Screen name="More" options={{ headerShown: false }}>
          {() => <MoreStack onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
