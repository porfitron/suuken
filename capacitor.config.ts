import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kinkeda.app',
  appName: 'Kinkeda',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 60000,
      backgroundColor: '#0d0e12',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    Keyboard: {
      resizeOnFullScreen: false,
    },
    SystemBars: {
      // Prevent Capacitor from adding bottom padding when the IME opens (causes white gap on Android WebView).
      insetsHandling: 'disable',
    },
  },
};

export default config;
