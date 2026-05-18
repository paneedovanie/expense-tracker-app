import { Stack } from "expo-router";

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="add" options={{ headerTitle: "Add Expense" }} />
      <Stack.Screen name="view" options={{ headerTitle: "View Expense" }} />
      <Stack.Screen name="payments" options={{ headerTitle: "Payments" }} />
      <Stack.Screen name="summary" options={{ headerTitle: "Summary" }} />
    </Stack>
  );
}
