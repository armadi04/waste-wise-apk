import { Tabs } from 'expo-router';
import { FileText, Home, UserRound } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: ComponentType<{ color?: ColorValue; size?: number }>;
  color: ColorValue;
  focused: boolean;
}) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        width: 56,
        height: 28,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.selectedBackground : 'transparent',
      }}
    >
      <Icon color={color} size={22} />
    </View>
  );
}

export default function TabsLayout() {
  const { colors, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.selectedForeground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'My Reports',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={FileText} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={UserRound} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
