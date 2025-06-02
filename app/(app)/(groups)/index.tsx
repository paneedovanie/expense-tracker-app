import Avatar from "@/components/avatar/Avatar";
import FabButton from "@/components/buttons/FabButton";
import FabMenuButton from "@/components/buttons/FabMenuButton";
import { useGroups } from "@/hooks";
import { IGroup } from "@/types";
import { getFileUrlFromKey } from "@/utils";
import {
  Layout,
  List,
  ListItem,
  Icon,
  Text,
  Spinner,
} from "@ui-kitten/components";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function GroupsScreen() {
  const { groups, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useGroups();

  const renderItem = ({
    item,
    index,
  }: {
    item: IGroup;
    index: number;
  }): React.ReactElement => (
    <ListItem
      style={styles.listItem}
      title={item.name}
      description={item.description}
      accessoryLeft={(props) => (
        <Avatar
          {...props}
          src={getFileUrlFromKey(item.avatarUrl)}
          style={styles.avatar}
          shape="rounded"
        />
      )}
      onPress={() => {
        router.push({
          pathname: "/(app)/(groups)/view",
          params: { id: item.id },
        });
      }}
    />
  );

  const addGroup = () => router.push("/(app)/(groups)/add");
  const joinGroup = () => router.push("/(app)/(groups)/add");

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
        />
      ) : isFetching ? (
        <View style={styles.emptyState}>
          <Spinner />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="people-outline" fill="#8F9BB3" style={styles.emptyIcon} />
          <Text appearance="hint" category="s1">
            No groups found.
          </Text>
        </View>
      )}
      <FabButton iconName="plus-outline" onPress={addGroup} />
      <FabMenuButton
        iconName="plus"
        menuItems={[
          {
            icon: "person-add-outline",
            label: "Join Group",
            onPress: joinGroup,
          },
          { icon: "plus-outline", label: "Add Group", onPress: addGroup },
        ]}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  listItem: { height: 100 },
  avatar: { width: 80, height: 80 },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
