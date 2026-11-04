import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'WasteWise',
  slug: 'waste-wise-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'wastewise',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  web: {
    favicon: './assets/favicon.png',
  },
  ios: {
    supportsTablet: false,
  },
  android: {
    package: 'com.bilcode.wastewise',
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/adaptive-icon-foreground.png',
      monochromeImage: './assets/adaptive-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
    ],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-image',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: {
          image: './assets/splash-icon.png',
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic:
            process.env.EAS_BUILD_PROFILE !== 'production',
        },
      },
    ],
    '@react-native-google-signin/google-signin',
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
