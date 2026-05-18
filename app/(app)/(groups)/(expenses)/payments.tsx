import { IPayment } from "@/types";
import { formatCurrency, getFileUrlFromKey } from "@/utils";
import { Text, Icon, Layout, Spinner } from "@ui-kitten/components";
import { ScrollView, StyleSheet, View } from "react-native";
import Avatar from "@/components/avatar/Avatar";
import { map } from "lodash";
import { useLocalSearchParams } from "expo-router";
import { useExpenses } from "@/hooks";
import dayjs from "dayjs";

export default function ExpensePaymentsScreen() {
  const { expenseId } = useLocalSearchParams();

  const { expense, isFetching } = useExpenses({
    id: expenseId as string,
  });

  const renderItem = (item: IPayment, i: number) => (
    <View style={styles.listItem} key={i}>
      <View style={styles.row}>
        <Avatar
          src={getFileUrlFromKey(item.payer?.avatarUrl)}
          style={styles.avatar}
        />
        <Icon name="arrow-right" fill="#8F9BB3" style={styles.arrowIcon} />
        <Avatar
          src={getFileUrlFromKey(item.receiver?.avatarUrl)}
          style={styles.avatar}
        />
        <Text style={styles.amount}>{formatCurrency(item.amount, "PHP")}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.names} numberOfLines={1} ellipsizeMode="tail">
          {item.payer.fullName} <Text appearance="hint">paid</Text>{" "}
          {item.receiver.fullName}
        </Text>
        <Text style={styles.date} appearance="hint">
          {item.createdAt
            ? dayjs(item.createdAt).format("MMM d, YYYY, HH:mm A")
            : ""}
        </Text>
      </View>
    </View>
  );

  const payments = expense?.payments ?? [];

  if (isFetching) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

  if (!payments.length) {
    return (
      <Text appearance="hint" style={styles.emptyText}>
        No payments recorded.
      </Text>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {map(payments, renderItem)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F9FC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    padding: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#EDF1F7",
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
    alignSelf: "center",
  },
  amount: {
    marginLeft: "auto",
    fontWeight: "bold",
    color: "#1A7270",
    fontSize: 16,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#8F9BB3",
    fontSize: 16,
  },
  listItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  names: {
    fontSize: 15,
    color: "#222B45",
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 13,
    color: "#8F9BB3",
  },
});
