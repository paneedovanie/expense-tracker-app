import { Button, Spinner } from "@ui-kitten/components";
import { GestureResponderEvent } from "react-native";

export interface DevLoginProps {
  isLoading: boolean;
  onSubmit: (event: GestureResponderEvent) => void;
}

export default function DevLogin({ isLoading, onSubmit }: DevLoginProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Button
      onPress={onSubmit}
      disabled={isLoading}
      accessoryLeft={isLoading ? () => <Spinner size="tiny" /> : undefined}
      accessibilityLabel="Dev Login"
    >
      Dev Login
    </Button>
  );
}
