import { Tabs } from "expo-router";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from "@ui-kitten/components";
import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useAuth } from "@/hooks";
import { StyleSheet } from "react-native";

const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => {
        const route = state.routes[index];
        navigation.navigate(route.name);
      }}
      appearance="noIndicator"
    >
      <BottomNavigationTab
        icon={(props) => (
          <Icon
            {...props}
            name="people-outline"
            style={[props?.style, styles.icon]}
          />
        )}
        title="Groups"
      />
      <BottomNavigationTab
        icon={(props) => (
          <Icon
            {...props}
            name="plus-outline"
            style={[props?.style, styles.icon]}
          />
        )}
        disabled
        title="Add (TBD)"
      />
      <BottomNavigationTab
        icon={(props) => (
          <Icon
            {...props}
            name="person-outline"
            style={[props?.style, styles.icon]}
          />
        )}
        title="Profile"
      />
    </BottomNavigation>
  );
};

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ tabBarShowLabel: false, headerShadowVisible: false }}
    >
      <Tabs.Screen name="(groups)" options={{ headerShown: false }} />
      <Tabs.Screen name="add" options={{ headerTitle: "" }} />
      <Tabs.Screen name="(profile)" options={{ headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
  },
});
