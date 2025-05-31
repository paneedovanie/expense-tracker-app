import { apiBaseUrl } from "@/constants/env";

export const getFileUrlFromKey = (key?: string) => {
  if (!key) return key;
  return `${apiBaseUrl}/api/v1/files?key=${key}`;
};
