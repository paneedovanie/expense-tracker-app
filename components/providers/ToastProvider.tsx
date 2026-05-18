import React, { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { EvaStatus } from "@ui-kitten/components/devsupport";
import { Toast, ToastProps } from "../toasts/Toast";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";

interface ShowToastOptions {
  message: string | React.ReactNode;
  status: EvaStatus;
  duration?: number;
}

interface ToastCtx {
  showToast: (options: ShowToastOptions) => void;
}

export const ToastContext = React.createContext<ToastCtx>({
  showToast: () => null,
});

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const onClose = useCallback(
    (id: string) => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    },
    [setToasts]
  );

  // Function to clear all toasts
  const closeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      setToasts((prevToasts) => [
        ...prevToasts,
        {
          id: `${Math.random()}`,
          status: options.status,
          message: options.message,
          duration: options.duration || 5000,
          onClose,
        },
      ]);
    },
    [setToasts]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <TouchableWithoutFeedback onPress={closeAllToasts}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <>
        {toasts.map((toast) => (
          <Toast {...toast} key={toast.id} />
        ))}
      </>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 999,
  },
});
