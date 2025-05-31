import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useExpenses, useGroups } from "@/hooks";
import Avatar from "@/components/avatar/Avatar";
import { Layout, Text, Spinner, Icon } from "@ui-kitten/components";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { getFileUrlFromKey } from "@/utils";
import { useLayoutEffect } from "react";
import GroupViewHeaderMenu from "@/components/groups/view/GroupViewHeaderMenu";
import GroupViewExpenses from "@/components/groups/view/GroupViewExpenses";
import { map } from "lodash";

export default function ViewGroupScreen() {
  const searchParams = useLocalSearchParams();
  const id = searchParams.id as string;
  const { group, isFetching } = useGroups({ id });
  const navigation = useNavigation();

  const { expenses } = useExpenses();

  // Example floating button: navigates to Manage Members
  const handleFabPress = () => {
    router.push({
      pathname: "/(app)/(groups)/(expenses)/add",
      params: { groupId: id },
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <GroupViewHeaderMenu id={id} />,
    });
  }, [navigation, id]);

  if (isFetching) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout style={styles.centered}>
        <Text status="danger">Group not found.</Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <Avatar
          src={getFileUrlFromKey(group.avatarUrl)}
          style={styles.avatar}
        />
        <Text category="h4" style={styles.name}>
          {group.name}
        </Text>
        <Text appearance="hint" style={styles.description}>
          {group.description}
        </Text>
      </View>
      <GroupViewExpenses />
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
        <Icon name="plus-outline" fill="#fff" style={styles.fabIcon} />
      </TouchableOpacity>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  name: {
    marginTop: 8,
    fontWeight: "bold",
  },
  description: {
    marginTop: 8,
    textAlign: "center",
    color: "#888",
  },
  editButton: {
    marginTop: 24,
    width: "100%",
  },
  manageButton: {
    marginTop: 12,
    width: "100%",
  },
  fab: {
    position: "absolute",
    right: 32,
    bottom: 32,
    backgroundColor: "#3366FF",
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
