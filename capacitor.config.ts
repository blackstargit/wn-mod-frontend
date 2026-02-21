import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.novel.app",
  appName: "NovelApp",
  webDir: "dist",
  server: {
    androidScheme: "http", // remove it later
  },
};

export default config;
