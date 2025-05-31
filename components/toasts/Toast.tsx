import React, { useEffect } from "react";
import { Text, Card } from "@ui-kitten/components";
import { EvaStatus } from "@ui-kitten/components/devsupport";
import { View, StyleSheet } from "react-native";

export interface ToastProps {
  id: string;
  message: string | React.ReactNode;
  status: EvaStatus;
  duration: number;
  onClose: (id: string) => void;
}

export const Toast = ({
  id,
  status,
  message,
  duration,
  onClose,
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card} status={status}>
        {typeof message === "string" ? (
          <Text style={styles.text}>{message}</Text>
        ) : (
          message
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 10,
    width: "100%",
    justifyContent: "center",
  },
  card: {
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 8,
    marginLeft: 20,
    marginRight: 20,
  },
  text: {
    fontWeight: "bold",
  },
});
