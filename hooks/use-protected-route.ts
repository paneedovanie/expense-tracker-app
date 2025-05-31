import { Href, useRouter, useSegments } from "expo-router";
import { useAuth } from "./use-auth";
import { useEffect } from "react";

export function useProtectedRoute() {
  const { user, isFetching } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isFetching) {
      const inAuthGroup = segments[0] === "(auth)";

      if (user && inAuthGroup) {
        // User is logged in and trying to access auth pages, redirect to app
        router.replace("/(app)" as Href);
      } else if (!user && !inAuthGroup) {
        // User is not logged in and trying to access app pages, redirect to auth
        router.replace("/(auth)" as Href);
      }
    }
  }, [user, isFetching, segments, router]);
}
