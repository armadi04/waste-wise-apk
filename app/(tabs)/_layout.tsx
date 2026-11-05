import { Tabs } from 'expo-router';
import { FileText, Home, UserRound } from 'lucide-react-native';

import { FloatingTabBar } from '@/components/navigation/floating-tab-bar';
import {
  TabBarInsetContext,
  useFloatingTabBarInset,
} from '@/components/navigation/tab-bar-inset';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const inset = useFloatingTabBarInset();
  return (
    <TabBarInsetContext.Provider value={inset}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'My Reports',
            tabBarIcon: ({ color, size }) => (
              <FileText color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <UserRound color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </TabBarInsetContext.Provider>
  );
}
