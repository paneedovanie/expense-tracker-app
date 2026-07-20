import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactNode } from "react";
import { useToast } from "./ToastProvider";
import { join } from "lodash";

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const toast = useToast();

  const onError = (err: unknown) => {
    let message = (err as Error).message;
    if (message) {
      if (Array.isArray(message)) {
        message = join(message, ", ");
      }
    }

    toast.showToast({
      status: "danger",
      message: message ?? err,
    });
  };

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        onError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, mutation) => {
        onError(error);
      },
    }),
    defaultOptions: {
      queries: {
        throwOnError: false,
        retry: false,
      },
      mutations: {
        throwOnError: false,
      },
    },
  });

  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
