import { useRouter, type Tabs } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState, type ComponentProps } from 'react';
import { Keyboard, Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

import {
  FLOATING_TAB_BAR_HEIGHT,
  useFloatingTabBarOffset,
} from './tab-bar-inset';

export type FloatingTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

const PILL_PADDING = 4;

function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: FloatingTabBarProps) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const router = useRouter();
  const bottom = useFloatingTabBarOffset();
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible) return null;

  const shadow = {
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        bottom,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          flex: 1,
          flexDirection: 'row',
          height: FLOATING_TAB_BAR_HEIGHT,
          padding: PILL_PADDING,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          backgroundColor: colors.surface,
          ...shadow,
        }}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const { options } = descriptor;
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const color = focused
            ? colors.selectedForeground
            : colors.mutedForeground;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={() =>
                emitter.emit({ type: 'tabLongPress', target: route.key })
              }
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderRadius: radius.pill,
                backgroundColor: focused
                  ? colors.selectedBackground
                  : pressed
                    ? colors.surfaceHover
                    : 'transparent',
              })}
            >
              {options.tabBarIcon?.({ focused, color, size: 22 })}
              <AppText
                numberOfLines={1}
                color={color}
                style={{
                  fontSize: 12,
                  lineHeight: 16,
                  fontFamily: focused ? fontFamily.semibold : fontFamily.medium,
                }}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New report"
        onPress={() => router.push('/reports/create')}
        style={({ pressed }) => ({
          width: FLOATING_TAB_BAR_HEIGHT,
          height: FLOATING_TAB_BAR_HEIGHT,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          ...shadow,
        })}
      >
        <Plus size={26} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}
