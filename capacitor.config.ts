import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.cosfy.app',
  appName: 'Cosfy',
  webDir: 'public',
  server: {
    url: 'https://www.cosfy.in',
    androidScheme: 'https'
  }
};

export default config;
