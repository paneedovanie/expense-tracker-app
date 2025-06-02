import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Groups",
        }}
      />
      <Stack.Screen name="add" options={{ headerTitle: "Add Group" }} />
      <Stack.Screen
        name="view"
        options={{
          headerTitle: "View Group",
        }}
      />
      <Stack.Screen name="edit" options={{ headerTitle: "Edit Group" }} />
      <Stack.Screen name="(members)" options={{ headerShown: false }} />
      <Stack.Screen name="(expenses)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  addButton: {
    padding: 0,
    margin: 0,
  },
});
