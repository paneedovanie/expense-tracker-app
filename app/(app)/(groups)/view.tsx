import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useGroups } from "@/hooks";
import Avatar from "@/components/avatar/Avatar";
import { Layout, Text, Spinner } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import { getFileUrlFromKey } from "@/utils";
import { useLayoutEffect } from "react";
import GroupViewHeaderMenu from "@/components/groups/view/GroupViewHeaderMenu";
import GroupViewExpenses from "@/components/groups/view/GroupViewExpenses";
import FabButton from "@/components/buttons/FabButton";

export default function ViewGroupScreen() {
  const searchParams = useLocalSearchParams();
  const id = searchParams.id as string;
  const { group, isFetching } = useGroups({ id });
  const navigation = useNavigation();

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
      <FabButton iconName="plus-outline" onPress={handleFabPress} />
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
});
