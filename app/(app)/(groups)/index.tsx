import Avatar from "@/components/avatar/Avatar";
import FabButton from "@/components/buttons/FabButton";
import { useGroups } from "@/hooks";
import { IGroup } from "@/types";
import { getFileUrlFromKey, getGroupMemberFullname } from "@/utils";
import { Layout, List, Text, Spinner, Icon } from "@ui-kitten/components";
import { router } from "expo-router";
import { join, map } from "lodash";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function GroupsScreen() {
  const { groups, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useGroups();

  const renderItem = ({
    item,
  }: {
    item: IGroup;
    index: number;
  }): React.ReactElement => {
    const displayedMembers = item.members?.slice(0, 3) || [];
    const undisplayedCount =
      (item.members?.length || 0) - displayedMembers.length;
    const description =
      displayedMembers.length > 0
        ? join(
            map(displayedMembers, (m) =>
              getGroupMemberFullname(item, m.userId)
            ),
            ", "
          ) + (undisplayedCount > 0 ? ` +${undisplayedCount}` : "")
        : "No members";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          router.push({
            pathname: "/(app)/(groups)/view",
            params: { groupId: item.id },
          });
        }}
      >
        <Avatar
          src={getFileUrlFromKey(item.avatarUrl)}
          style={styles.avatar}
          variants={["rounded"]}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            display: "flex",
          }}
        >
          <Icon
            name="arrow-ios-forward"
            fill="#8F9BB3"
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const addGroup = () => router.push("/(app)/(groups)/add");

  const handleEndReached = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <Layout style={styles.container}>
      {groups && groups.length > 0 ? (
        <List
          data={groups}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <Spinner size="small" />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      ) : isFetching ? (
        <View style={styles.emptyState}>
          <Spinner />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text appearance="hint" category="s1">
            No groups found.
          </Text>
        </View>
      )}
      <FabButton iconName="plus-outline" onPress={addGroup} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: { width: 56, height: 56, borderRadius: 16, marginRight: 16 },
  info: { flex: 3, justifyContent: "center" },
  name: {
    fontWeight: "700",
    fontSize: 18,
    color: "#222B45",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: "#8F9BB3",
    marginTop: 2,
    marginBottom: 0,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    width: 20,
    height: 20,
    alignSelf: "flex-end",
  },
});
