import { Button, Text } from "@ui-kitten/components";
import { router, Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function GroupsLayout() {
  const addGroup = () => router.push("/(app)/(groups)/add");

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
          headerRight: () => (
            <Button
              style={styles.addButton}
              appearance="ghost"
              size="small"
              onPress={addGroup}
            >
              <Text>Add</Text>
            </Button>
          ),
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
      <Stack.Screen
        name="members"
        options={{ headerTitle: "Manage Group Members" }}
      />
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
