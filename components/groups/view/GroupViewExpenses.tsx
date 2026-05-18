import { useExpenses } from "@/hooks";
import { Layout, Text, Spinner, Icon } from "@ui-kitten/components";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  formatCurrency,
  getExpenseAmount,
  getGroupMemberFullname,
} from "@/utils";
import { router, useNavigation } from "expo-router";
import Avatar from "@/components/avatar/Avatar";
import { IGroup } from "@/types";

export interface IGroupViewExpensesProps {
  group: IGroup;
}

export default function GroupViewExpenses({ group }: IGroupViewExpensesProps) {
  const { expenses, isFetching } = useExpenses({ groupId: group.id });

  if (isFetching) {
    return (
      <View style={styles.centered}>
        <Spinner />
      </View>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="file-text-outline"
          fill="#8F9BB3"
          style={styles.emptyIcon}
        />
        <Text appearance="hint" category="s1">
          No expenses yet.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const totalAmount = getExpenseAmount(item);

        return (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/(app)/(groups)/(expenses)/view",
                params: { groupId: group.id, expenseId: item.id },
              })
            }
          >
            <View style={styles.cardContent}>
              <View>
                <Avatar style={styles.avatar} shape="rounded" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseDesc} numberOfLines={1}>
                  {item.description || "No description"}
                </Text>
                <Text style={styles.expenseCaption} numberOfLines={1}>
                  {getGroupMemberFullname(group, item.paidByShares[0]?.userId)}
                  {item.paidByShares?.length > 1
                    ? ` +${item.paidByShares?.length - 1}`
                    : ""}{" "}
                  paid {formatCurrency(totalAmount, "PHP")}
                </Text>
                <Text style={styles.expenseDate} appearance="hint">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>{formatCurrency(totalAmount)}</Text>
                <Icon
                  name="arrow-ios-forward"
                  fill="#8F9BB3"
                  style={styles.arrowIcon}
                />
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    shadowColor: "#222",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {},
  expenseDesc: {
    fontWeight: "600",
    fontSize: 16,
    color: "#222B45",
    marginBottom: 2,
  },
  expenseCaption: {
    fontSize: 12,
  },
  expenseDate: {
    fontSize: 13,
    color: "#8F9BB3",
  },
  amountContainer: {
    alignItems: "flex-end",
    marginLeft: 16,
    flexDirection: "row",
    gap: 4,
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1A7270",
    marginRight: 4,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    alignSelf: "center",
  },
  centered: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
});
