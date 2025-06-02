import Avatar from "@/components/avatar/Avatar";
import { useAuth } from "@/hooks";
import { getFileUrlFromKey } from "@/utils";
import { Layout, Text, Button, Divider } from "@ui-kitten/components";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
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
      </View>
      <Button
        style={styles.updateProfileButton}
        appearance="outline"
        onPress={() => router.push("/(app)/(profile)/update")}
      >
        Update Profile
      </Button>
      <Divider style={styles.divider} />
      <Button style={styles.logoutButton} status="danger" onPress={logout}>
        Logout
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  name: {
    marginTop: 16,
    fontWeight: "bold",
  },
  email: {
    marginTop: 4,
    color: "#888",
  },
  divider: {
    marginVertical: 24,
  },
  logoutButton: {
    marginTop: 16,
  },
  avatar: {
    width: 96,
    height: 96,
  },
  changePasswordButton: {
    marginBottom: 8,
  },
  updateProfileButton: {
    marginBottom: 8,
  },
});
