import { Link, router, useLocalSearchParams, useNavigation } from "expo-router";
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
  const groupId = searchParams.groupId as string;
  const { group, isFetching } = useGroups({ id: groupId });
  const navigation = useNavigation();

  const handleFabPress = () => {
    router.push({
      pathname: "/(app)/(groups)/(expenses)/add",
      params: { groupId },
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <GroupViewHeaderMenu id={groupId} />,
    });
  }, [navigation, groupId]);

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
        <Text style={styles.name}>{group.name}</Text>
        {group.description ? (
          <Text style={styles.description}>{group.description}</Text>
        ) : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Link
            href={{
              pathname: "/(app)/(groups)/summary",
              params: { groupId },
            }}
            style={styles.paymentsLink}
          >
            <Text status="primary" style={styles.paymentsLinkText}>
              View summary
            </Text>
          </Link>
        </View>
      </View>
      <GroupViewExpenses group={group} />
      <FabButton iconName="plus-outline" onPress={handleFabPress} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#222",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#EDF1F7",
    backgroundColor: "#F7F9FC",
  },
  name: {
    fontWeight: "700",
    fontSize: 22,
    color: "#222B45",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: "#8F9BB3",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 0,
    maxWidth: 260,
  },
  paymentsLink: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
  paymentsLinkText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#1A7270",
  },
});
