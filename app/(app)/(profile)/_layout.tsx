import { Stack, Tabs } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ headerTitle: "" }} />
      <Stack.Screen name="update" options={{ headerTitle: "Update Profile" }} />
      <Stack.Screen
        name="change-password"
        options={{ headerTitle: "Change Password" }}
      />
    </Stack>
  );
}
