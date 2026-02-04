import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.slingshotnews.app',
  appName: 'Slingshot News',
  webDir: 'dist',
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0a',
      showSpinner: false
    }
  }
};

export default config;
