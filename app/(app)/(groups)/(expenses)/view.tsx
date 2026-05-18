import { useExpenses } from "@/hooks";
import {
  Layout,
  Text,
  Spinner,
  Divider,
  Icon,
  Button,
  CircularProgressBar,
} from "@ui-kitten/components";
import { Link, router, useLocalSearchParams, useNavigation } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { useLayoutEffect, useMemo, useState } from "react";
import { UserShares } from "@/components/expenses/UserShares";
import { formatCurrency, getExpenseAmount, getPaidForMapper } from "@/utils";
import { useToast } from "@/components/providers/ToastProvider";
import { forEach } from "lodash";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { useQueryClient } from "react-query";

export default function ViewExpenseScreen() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigation = useNavigation();
  const { groupId, expenseId } = useLocalSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [editable, setEditable] = useState(false);

  const {
    expense,
    isFetching,
    isLoading,
    setteUp,
    update,
    refetchOne,
    refetchMany,
    remove,
  } = useExpenses({
    id: expenseId as string,
  });

  const progress = useMemo(() => {
    let total = 0;
    const paidForMapper = expense ? getPaidForMapper(expense) : {};
    forEach(expense?.paidByShares, (share) => {
      total += paidForMapper[share.userId]
        ? Math.min(share.amount, paidForMapper[share.userId])
        : 0;
    });
    forEach(expense?.payments, (payment) => {
      total += Number(payment.amount);
    });
    return total && total / (getExpenseAmount(expense) ?? 0);
  }, [JSON.stringify(expense)]);

  const handleSettleUp = (userId: string) => {
    setteUp(
      { userId },
      {
        onSuccess: async () => {
          refetchOne();
          refetchMany();
          setSelectedUserId(undefined);
          toast.showToast({
            status: "success",
            message: "Settle up request sent successfully.",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            remove(undefined, {
              onSuccess: async () => {
                await queryClient.refetchQueries(["expenses", groupId]);
                router.back();
                toast.showToast({
                  status: "success",
                  message: `Expense removed successfully`,
                });
              },
            });
          },
        },
      ]
    );
  };

  // Add edit button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          appearance="ghost"
          accessoryLeft={
            <Icon name={editable ? "close-outline" : "edit-outline"} />
          }
          onPress={() => setEditable((value) => !value)}
        />
      ),
    });
  }, [navigation, expenseId, groupId, editable]);

  // Loading state
  if (isFetching) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

  // Expense not found
  if (!expense) {
    return (
      <Layout style={styles.centered}>
        <Text status="danger">Expense not found.</Text>
      </Layout>
    );
  }

  if (editable) {
    return (
      <Layout style={styles.container}>
        <ExpenseForm
          loading={isLoading}
          group={expense.group}
          expense={expense}
          onSubmit={(input) =>
            update(input, {
              onSuccess: () => {
                queryClient.invalidateQueries(["expenses", groupId]);
                toast.showToast({
                  status: "success",
                  message: `Expense updated successfully`,
                });
                setEditable(false);
              },
            })
          }
          additionalAction={
            <Button status="danger" onPress={handleDelete} disabled={isLoading}>
              Delete
            </Button>
          }
        />
      </Layout>
    );
  }

  // Main render
  return (
    <Layout style={styles.container}>
      <Layout style={styles.headerCard}>
        <Text category="h5" style={styles.title}>
          {expense.description}
        </Text>
        <Text style={styles.createdAt} appearance="hint">
          Created: {new Date(expense.createdAt).toLocaleString()}
        </Text>
        <Divider style={styles.divider} />
        <View style={styles.details}>
          <View style={{ flex: 1 }}>
            <Text category="s1" style={styles.amountLabel}>
              Amount:
              <Text status="primary" style={styles.amountValue}>
                {" "}
                {formatCurrency(getExpenseAmount(expense), "PHP")}
              </Text>
            </Text>
            <Text category="s1" style={styles.categoryLabel}>
              Category:{" "}
              <Text style={styles.categoryValue}>{expense.category}</Text>
            </Text>
          </View>
          <View style={styles.circularProgressContainer}>
            <CircularProgressBar progress={progress} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Link
            href={{
              pathname: "/(app)/(groups)/(expenses)/payments",
              params: { expenseId },
            }}
            style={styles.paymentsLink}
          >
            <Text status="primary" style={styles.paymentsLinkText}>
              View payments
            </Text>
          </Link>
          <Link
            href={{
              pathname: "/(app)/(groups)/(expenses)/summary",
              params: { expenseId },
            }}
            style={styles.paymentsLink}
          >
            <Text status="primary" style={styles.paymentsLinkText}>
              View summary
            </Text>
          </Link>
        </View>
      </Layout>
      <UserShares
        loading={isLoading}
        expense={expense}
        selectedUserId={selectedUserId}
        onSettleUp={handleSettleUp}
        onSelectUserId={setSelectedUserId}
      />
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
    backgroundColor: "#fff",
  },
  headerSection: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  title: {
    marginBottom: 4,
    fontWeight: "bold",
    fontSize: 20,
    color: "#222B45",
  },
  createdAt: {
    fontSize: 13,
    color: "#8F9BB3",
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "#EDF1F7",
  },
  date: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    color: "#8F9BB3",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  headerCard: {
    margin: 16,
    borderRadius: 18,
    backgroundColor: "#fff",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#1A7270",
    borderRadius: 4,
  },
  amountLabel: {
    fontWeight: "600",
    marginBottom: 2,
    fontSize: 15,
    color: "#222B45",
  },
  amountValue: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1A7270",
  },
  categoryLabel: {
    marginTop: 2,
    marginBottom: 2,
    color: "#8F9BB3",
    fontSize: 14,
  },
  categoryValue: {
    color: "#1A7270",
    fontWeight: "600",
    fontSize: 14,
  },
  circularProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
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
