import { useToast } from "@/components/providers/ToastProvider";
import { useGroups, useUsers } from "@/hooks";
import { IUser } from "@/types";
import {
  Layout,
  Text,
  Button,
  Input,
  List,
  ListItem,
} from "@ui-kitten/components";
import { useLocalSearchParams } from "expo-router";
import { filter, find, map } from "lodash";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export interface IAddMemberScreenProps {
  groupId: string;
}

export default function AddMemberScreen({}: IAddMemberScreenProps) {
  const searchParams = useLocalSearchParams();
  const groupId = searchParams.groupId as string;
  const toast = useToast();
  const { group, addMembers, refetch } = useGroups({ id: groupId });
  const { users, search, setSearch } = useUsers();

  const members = group?.members;

  // Set of userIds for quick lookup (to avoid adding existing members)
  const membersSet = useMemo(
    () => new Set(map(members, (m) => m.userId)),
    [members]
  );

  // Filter users for suggestions (exclude already added members)
  const filteredSuggestions = filter(
    users,

    ({ id }) => !membersSet.has(id)
  );

  if (search?.length && !find(members, (m) => m.user.fullName === search)) {
    filteredSuggestions.push({
      id: "",
      fullName: search ?? "",
      email: null,
    } as IUser);
  }

  // Add a new member to the group and update local state
  const handleAddMember = (userId: string) => {
    addMembers(
      { userIds: [userId] },
      {
        onSuccess: async () => {
          refetch();
          toast.showToast({
            status: "success",
            message: "New member added",
          });
          membersSet.add(userId);
        },
      }
    );
  };

  return (
    <Layout style={styles.container}>
      <Input
        placeholder="Search full name or email"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />
      {/* User Suggestions Dropdown */}
      {(search?.length ?? 0) > 0 && (
        <List
          style={styles.suggestions}
          data={filteredSuggestions}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptySuggestion}>
              <Text appearance="hint" category="s2" style={{ padding: 12 }}>
                No users found.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ListItem
              title={item?.fullName}
              description={item?.email}
              accessoryRight={() => (
                <Button
                  size="tiny"
                  onPress={() => handleAddMember(item.id || item.fullName)}
                >
                  Add
                </Button>
              )}
            />
          )}
        />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 24, backgroundColor: "#fff" },
  input: {},
  suggestions: { backgroundColor: "white" },
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
});
