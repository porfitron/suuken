import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kinkeda.app',
  appName: 'Kinkeda',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
