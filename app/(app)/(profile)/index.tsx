import Avatar from "@/components/avatar/Avatar";
import { useAuth } from "@/hooks";
import { getFileUrlFromKey } from "@/utils";
import { Layout, Text, Button, Divider, useTheme } from "@ui-kitten/components";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  return (
    <Layout
      style={[
        styles.container,
        { backgroundColor: theme["background-basic-color-1"] },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme["background-basic-color-2"],
            shadowColor: theme["color-basic-900"],
          },
        ]}
      >
        <Avatar
          src={getFileUrlFromKey(user?.avatarUrl)}
          style={styles.avatar}
        />
        <Text category="h5" style={styles.name}>
          {user?.fullName}
        </Text>
        <Text appearance="hint" style={styles.email}>
          {user?.email}
        </Text>
        <Button
          style={styles.updateProfileButton}
          appearance="outline"
          status="primary"
          onPress={() => router.push("/(app)/(profile)/update")}
        >
          Update Profile
        </Button>
        <Divider style={styles.divider} />
        <Button style={styles.logoutButton} status="danger" onPress={logout}>
          Logout
        </Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  name: {
    marginTop: 16,
    fontWeight: "bold",
    fontSize: 22,
    letterSpacing: 0.2,
  },
  email: {
    marginTop: 4,
    color: "#8F9BB3",
    fontSize: 15,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
    width: "100%",
    backgroundColor: "#EDF1F7",
  },
  logoutButton: {
    marginTop: 8,
    width: "100%",
    borderRadius: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 8,
    borderRadius: 48,
  },
  updateProfileButton: {
    marginTop: 16,
    width: "100%",
    borderRadius: 12,
  },
});
