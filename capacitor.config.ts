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
  },
};

export default config;
