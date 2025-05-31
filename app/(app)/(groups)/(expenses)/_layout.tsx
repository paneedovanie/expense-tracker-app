import { Stack } from "expo-router";

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="add" options={{ headerTitle: "Add Expense" }} />
    </Stack>
  );
}
