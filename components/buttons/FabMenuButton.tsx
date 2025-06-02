import React, { useState } from "react";
import { Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TouchableOpacityProps,
  Text,
} from "react-native";

export interface FabMenuItem {
  icon: string;
  label?: string;
  onPress: () => void;
}

export interface FabMenuButtonProps extends TouchableOpacityProps {
  iconName: string;
  menuItems: FabMenuItem[];
}

export default function FabMenuButton({
  iconName,
  menuItems,
  style,
  ...props
}: FabMenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {open &&
        menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.fab, styles.menu, { bottom: 76 * (idx + 1) }]}
            onPress={() => {
              setOpen(false);
              item.onPress();
            }}
            activeOpacity={0.8}
          >
            {item.label && <Text style={styles.menuLabel}>{item.label}</Text>}
            <Icon name={item.icon} fill="#fff" style={styles.fabIcon} />
          </TouchableOpacity>
        ))}
      <TouchableOpacity
        {...props}
        style={[styles.fab, styles.mainFab]}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Icon
          name={open ? "close" : iconName}
          fill="#fff"
          style={styles.fabIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 32,
    bottom: 32,
    alignItems: "center",
    zIndex: 100,
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3366FF",
    borderRadius: 32,
    width: 56,
    height: 56,
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: "absolute",
    right: 0,
  },
  mainFab: {
    position: "relative",
    marginBottom: 0,
  },
  fabIcon: {
    width: 28,
    height: 28,
    tintColor: "#fff",
  },
  menu: {
    backgroundColor: "#558BFF",
  },
  menuLabel: {
    color: "#558BFF",
    marginRight: 12,
    fontSize: 16,
    fontWeight: "500",
    position: "absolute",
    right: 50,
    textAlign: "right",
  },
});
