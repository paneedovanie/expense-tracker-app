import React, { FC, ReactNode, useCallback, useState } from "react";
import { EvaStatus } from "@ui-kitten/components/devsupport";
import { Toast, ToastProps } from "../toasts/Toast";

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
      <>
        {toasts.map((toast) => (
          <Toast {...toast} key={toast.id} />
        ))}
      </>
    </ToastContext.Provider>
  );
};
