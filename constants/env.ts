import Constants from "expo-constants";

export const apiBaseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://192.168.100.53:3000"
    : Constants.expoConfig?.extra?.apiBaseUrl;
