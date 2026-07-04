import 'dotenv/config';

export default {
  expo: {
    name: "Lucid AI",
    slug: "lucid-ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lucidai",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0a0a0f"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.lucidai.app",
      buildNumber: "1",
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        GADApplicationIdentifier: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0a0a0f"
      },
      package: "com.lucidai.app",
      versionCode: 1,
      permissions: ["RECORD_AUDIO", "RECEIVE_BOOT_COMPLETED", "VIBRATE"]
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      ["expo-notifications", {
        icon: "./assets/images/icon.png",
        color: "#7c3aed",
        defaultChannel: "default"
      }],
      ["expo-tracking-transparency", {
        "userTrackingPermission": "We use your data to provide personalized ads and improve your experience."
      }],
      ["react-native-google-mobile-ads", {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713",
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511"
      }]
    ],
    experiments: { typedRoutes: true },
    extra: {
      router: {},
      eas: { projectId: "d26bb7b2-57d8-4b23-b94a-32b1ac90a674" },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
};
