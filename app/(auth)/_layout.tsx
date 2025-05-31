import { useAuth } from "@/hooks";
import { Stack } from "expo-router";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
        </Stack>
      </TouchableWithoutFeedback>
    </>
  );
}
