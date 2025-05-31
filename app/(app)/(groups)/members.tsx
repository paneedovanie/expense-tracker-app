import { useLocalSearchParams } from "expo-router";
import { useGroups, useUsers } from "@/hooks";
import {
  Layout,
  Text,
  List,
  ListItem,
  Button,
  Spinner,
  Input,
} from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { IUser } from "@/types";
import { filter, map } from "lodash";

export default function ManageGroupMembersScreen() {
  // Hooks and state
  const toast = useToast();
  const { id } = useLocalSearchParams();
  const { group, isFetching, addMembers, removeMembers, isLoading } = useGroups(
    { id: id as string }
  );
  const { users, search, setSearch } = useUsers();
  const [newMember, setNewMember] = useState<IUser>();
  const [members, setMembers] = useState(group?.members ?? []);

  // Set of userIds for quick lookup (to avoid adding existing members)
  const membersSet = useMemo(
    () => new Set(map(members, (m) => m.userId)),
    [members]
  );

  // Keep local members state in sync with group.members
  useEffect(() => {
    if (group?.members) setMembers(group.members);
  }, [group?.members]);

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

  // Add a new member to the group and update local state
  const handleAddMember = () => {
    if (!newMember) return;
    addMembers(
      { userIds: [newMember.id] },
      {
        onSuccess: () => {
          setMembers((prev) => [
            ...prev,
            {
              id: Math.random().toString(), // Use backend id if available
              userId: newMember.id,
              user: newMember,
              groupId: group.id,
              group: group,
            },
          ]);
          setNewMember(undefined);
          setSearch(undefined);
          toast.showToast({
            status: "success",
            message: "New member added",
          });
        },
      }
    );
  };

  // Remove a member from the group and update local state
  const handleRemoveMember = (memberUserId: string) => {
    removeMembers(
      { userIds: [memberUserId] },
      {
        onSuccess: () => {
          setMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
          toast.showToast({
            status: "success",
            message: "One member removed",
          });
        },
      }
    );
  };

  // Handle search input change for user suggestions
  const handleSearchChange = (text: string) => {
    setSearch(text);
    setNewMember(undefined);
  };

  // Filter users for suggestions (exclude already added members)
  const filteredSuggestions = filter(users, ({ id }) => !membersSet.has(id));

  return (
    <Layout style={styles.container}>
      {/* Add Member Row */}
      <View style={styles.addRow}>
        <View style={{ flex: 1, position: "relative" }}>
          <Input
            placeholder="Search user by name or email"
            value={newMember ? newMember.firstName : search}
            onChangeText={handleSearchChange}
            style={styles.input}
            disabled={isLoading}
          />
          {/* User Suggestions Dropdown */}
          {(search?.length ?? 0) > 0 && !newMember && (
            <View style={styles.suggestions}>
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((user) => (
                  <Button
                    key={user.id}
                    appearance="ghost"
                    size="small"
                    style={styles.suggestionItem}
                    onPress={() => setNewMember(user)}
                  >
                    {user.firstName || user.email}
                  </Button>
                ))
              ) : (
                <View style={styles.emptySuggestion}>
                  <Text appearance="hint" category="s2" style={{ padding: 12 }}>
                    No users found.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        <Button
          onPress={handleAddMember}
          disabled={isLoading || !newMember}
          size="small"
        >
          Add
        </Button>
      </View>

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
              title={item.user?.firstName || item.user?.email}
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
  title: { marginBottom: 16 },
  addRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  input: { flex: 1, marginRight: 8 },
  suggestions: {
    backgroundColor: "#f7f9fc",
    borderRadius: 4,
    marginTop: 46,
    elevation: 2,
    zIndex: 10,
    position: "absolute",
    width: "100%",
  },
  suggestionItem: {
    justifyContent: "flex-start",
    width: "100%",
    borderRadius: 0,
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
