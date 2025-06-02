import { Stack } from "expo-router";

export default function MembersLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen
        name="index"
        options={{ headerTitle: "Manage Group Members" }}
      />
      <Stack.Screen name="add" options={{ headerTitle: "Add Group Member" }} />
    </Stack>
  );
}
