import { Text, Button, List, Modal, Card } from "@ui-kitten/components";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  formatCurrency,
  getFileUrlFromKey,
  getGroupMemberFullname,
  getPaidByMapper,
  getPaidForMapper,
  getPaymentReceivedMapper,
  getPaymentSentMapper,
} from "@/utils";
import { useCallback, useMemo } from "react";
import { IExpense } from "@/types";
import UserSharesItem from "./UserSharesItem";
import { filter } from "lodash";
import { IGroupMember } from "@/types/i-group-member";

export interface UserSharesProps {
  loading?: boolean;
  expense: IExpense;
  selectedUserId?: string;
  onSettleUp: (userId: string) => void;
  onSelectUserId: (userId?: string) => void;
}

export function UserShares({
  expense,
  loading,
  selectedUserId,
  onSettleUp,
  onSelectUserId,
}: UserSharesProps) {
  const paidByMapper = useMemo(
    () => getPaidByMapper(expense),
    [JSON.stringify(expense)]
  );

  const paidForMapper = useMemo(
    () => getPaidForMapper(expense),
    [JSON.stringify(expense)]
  );

  const paymentSentMapper = useMemo(
    () => getPaymentSentMapper(expense),
    [JSON.stringify(expense)]
  );

  const paymentReceivedMapper = useMemo(
    () => getPaymentReceivedMapper(expense),
    [JSON.stringify(expense)]
  );

  const handleSettleUp = useCallback(() => {
    if (!selectedUserId) return;
    onSettleUp(selectedUserId);
  }, [selectedUserId]);

  const expenseUsers = useMemo<IGroupMember[]>(
    () =>
      filter(
        expense.group.members,
        (member: IGroupMember) =>
          !!paidByMapper[member.user.id] || !!paidForMapper[member.user.id]
      ),
    [expense.group.members]
  );

  return (
    <View style={styles.wrapper}>
      <Text category="s1" style={styles.sectionTitle}>
        User Shares
      </Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A7270" />
        </View>
      ) : (
        <List
          style={styles.list}
          data={expenseUsers}
          renderItem={({ item }: { item: IGroupMember }) => {
            const userId = item.user.id;
            const fullname = getGroupMemberFullname(expense.group, item.userId);
            const amount =
              (paidByMapper[item.userId] ?? 0) -
              (paidForMapper[userId] ?? 0) -
              (paymentReceivedMapper[item.userId] ?? 0) +
              (paymentSentMapper[item.userId] ?? 0);

            const avatarUrl = getFileUrlFromKey(
              expense.group.members.find(
                (member) => member.user.id === item.userId
              )?.user.avatarUrl
            );

            return (
              <UserSharesItem
                fullname={fullname}
                amount={amount}
                avatarUrl={avatarUrl}
                onSettleUp={() => onSelectUserId(item.userId)}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Modal for settling up */}
      <Modal
        visible={!!selectedUserId}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => onSelectUserId(undefined)}
      >
        <Card disabled={true} style={styles.modalCard}>
          <Text category="h6" style={styles.modalTitle}>
            Settle up
          </Text>
          <Text style={styles.modalText}>
            {getGroupMemberFullname(expense.group, selectedUserId ?? "")} owes{" "}
            <Text status="danger" style={styles.modalAmount}>
              {formatCurrency(
                (paidByMapper[selectedUserId!] ?? 0) -
                  (paidForMapper[selectedUserId!] ?? 0),
                "PHP"
              )}
            </Text>{" "}
            for this expense.
          </Text>
          <Button
            status="primary"
            onPress={handleSettleUp}
            style={styles.settleButton}
            disabled={loading}
          >
            Settle Up
          </Button>
          <Button appearance="ghost" onPress={() => onSelectUserId(undefined)}>
            Cancel
          </Button>
        </Card>
      </Modal>
    </View>
  );
}

// Styles for the screen
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 0,
    margin: 0,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 16,
    color: "#222B45",
  },
  list: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    paddingVertical: 4,
    shadowColor: "#222",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F1F1",
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    minWidth: 260,
    maxWidth: 320,
  },
  modalTitle: {
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 18,
    color: "#222B45",
  },
  modalText: {
    marginBottom: 16,
    fontSize: 15,
    color: "#222B45",
  },
  modalAmount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  settleButton: {
    marginBottom: 8,
  },
});
