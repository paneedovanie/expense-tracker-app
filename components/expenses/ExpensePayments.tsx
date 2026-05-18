import { IExpense, IPayment } from "@/types";
import { formatCurrency, getFileUrlFromKey } from "@/utils";
import { Text, List, ListItem, Icon, useTheme } from "@ui-kitten/components";
import { ScrollView, StyleSheet, View } from "react-native";
import Avatar from "@/components/avatar/Avatar";
import { map } from "lodash";

export interface ExpensePaymentsProps {
  expense: IExpense;
}

export default function ExpensePayments({ expense }: ExpensePaymentsProps) {
  const theme = useTheme();
  // Assume expense.payments is an array of { id, user, amount }
  // user: { id, fullName, avatarUrl }
  const payments = expense.payments ?? [];

  const renderItem = (item: IPayment, i: number) => (
    <View style={styles.listItem} key={i}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Avatar src={getFileUrlFromKey(item.payer?.avatarUrl)} />
        <Icon name="arrow-forward-outline" style={{ width: 12, height: 12 }} />
        <Avatar src={getFileUrlFromKey(item.receiver?.avatarUrl)} />
      </View>
      <Text style={{ color: theme["text-hint-color"] }}>
        {item.payer.fullName} paid {formatCurrency(item.amount, "PHP")} to{" "}
        {item.receiver.fullName}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text category="h6" style={styles.title}>
        Payments
      </Text>
      {payments.length === 0 ? (
        <Text appearance="hint" style={styles.emptyText}>
          No payments recorded.
        </Text>
      ) : (
        <ScrollView>{map(payments, renderItem)}</ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    padding: 24,
  },
  avatar: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
  },
  listItem: {
    paddingInline: 24,
    paddingVertical: 8,
    gap: 8,
  },
});
