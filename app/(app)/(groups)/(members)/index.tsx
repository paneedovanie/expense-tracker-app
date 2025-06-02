import { router, useLocalSearchParams } from "expo-router";
import { useGroups } from "@/hooks";
import {
  Layout,
  Text,
  List,
  ListItem,
  Button,
  Spinner,
} from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import { useToast } from "@/components/providers/ToastProvider";
import FabButton from "@/components/buttons/FabButton";

export default function ManageGroupMembersScreen() {
  // Hooks and state
  const toast = useToast();
  const { id } = useLocalSearchParams();
  const { group, isFetching, removeMembers, isLoading, refetch } = useGroups({
    id: id as string,
  });

  const members = group?.members ?? [];

  // Show loading spinner while fetching group data
  if (isFetching) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

  // Show error if group not found
  if (!group) {
    return (
      <Layout style={styles.centered}>
        <Text status="danger">Group not found.</Text>
      </Layout>
    );
  }

  // Remove a member from the group and update local state
  const handleRemoveMember = (memberUserId: string) => {
    removeMembers(
      { userIds: [memberUserId] },
      {
        onSuccess: () => {
          refetch();
          toast.showToast({
            status: "success",
            message: "One member removed",
          });
        },
      }
    );
  };

  const addMember = () => {
    router.push({
      pathname: "/(app)/(groups)/(members)/add",
      params: { groupId: group.id },
    });
  };

  return (
    <Layout style={styles.container}>
      {/* Empty state for group members */}
      {members.length === 0 ? (
        <View style={styles.emptyMembers}>
          <Text appearance="hint" category="s1">
            No members in this group.
          </Text>
        </View>
      ) : (
        // Member List
        <List
          data={members}
          keyExtractor={(item) => item.id}
          style={{ backgroundColor: "white" }}
          renderItem={({ item }) => (
            <ListItem
              title={item.user?.fullName || item.user?.email}
              description={item.user?.email}
              accessoryRight={() =>
                item.user.id !== group.createdByUserId ? (
                  <Button
                    size="tiny"
                    status="danger"
                    onPress={() => handleRemoveMember(item.userId)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                ) : (
                  <Text>Owner</Text>
                )
              }
            />
          )}
        />
      )}
      <FabButton iconName="plus-outline" onPress={addMember} />
    </Layout>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptySuggestion: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  emptyMembers: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
});
