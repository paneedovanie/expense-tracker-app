import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { useAuth, useProtectedRoute } from "@/hooks";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { ToastProvider } from "@/components/providers/ToastProvider";
import * as Linking from "expo-linking";
import { apiBaseUrl } from "@/constants/env";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Content = () => {
  const { isFetching } = useAuth();
  useProtectedRoute();

  useEffect(() => {
    if (!isFetching) {
      SplashScreen.hideAsync();
    }
  }, [isFetching]);

  if (isFetching) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
};

export default function RootLayout() {
  const url = Linking.useURL();

  console.log("apiBaseUrl", apiBaseUrl);

  useEffect(() => {
    if (url) {
      console.log("App opened with URL:", url);
      // You can do additional logic here, like analytics or specific data fetching
    }
  }, [url]);

  return (
    <>
      <ApplicationProvider {...eva} theme={eva.light}>
        <ToastProvider>
          <ReactQueryProvider>
            <IconRegistry icons={EvaIconsPack} />
            <Content />
          </ReactQueryProvider>
        </ToastProvider>
      </ApplicationProvider>
    </>
  );
}
