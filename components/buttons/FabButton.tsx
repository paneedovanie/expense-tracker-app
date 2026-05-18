import { Icon, useTheme } from "@ui-kitten/components";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

export interface FabButtonProps extends TouchableOpacityProps {
  iconName: string;
}

export default function FabButton({ iconName, ...props }: FabButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.fab,
        props.style,
        { backgroundColor: theme["color-primary-500"] },
      ]}
    >
      <Icon name={iconName} fill="#fff" style={styles.fabIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 32,
    bottom: 32,
    backgroundColor: "#1A7270",
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabIcon: {
    width: 28,
    height: 28,
    tintColor: "#fff",
  },
});
