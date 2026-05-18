import React, { useEffect, useMemo } from "react";
import { Text, Input } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import { ESplitType, IGroup, IUser, TExpenseShareInput } from "@/types";
import { filter, forEach, includes, map, reduce, round } from "lodash";
import { useTheme } from "@ui-kitten/components";
import UsersSelector from "./UsersSelector";
import { formatCurrency, normalizeNumberInput } from "@/utils";

interface InputsProps {
  users: IUser[];
  totalAmount: number;
  value: TExpenseShareInput[];
  onChange: (value: TExpenseShareInput[]) => void;
}

const EqualInputs = ({ users, totalAmount, value, onChange }: InputsProps) => {
  // Helper to get user name by id
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.fullName || "Unknown";

  const handleAmountChange = (index: number, amount: number | string) => {
    value[index].amount = amount as number;
    onChange(value);
  };

  // Auto-compute shares for "Equal" split type
  useEffect(() => {
    const equalAmount = totalAmount
      ? Number((totalAmount / value.length).toFixed(2))
      : 0;

    // Calculate the difference to ensure total matches exactly
    const totalShares = equalAmount * value.length;
    const difference = totalAmount - totalShares;

    value.forEach((field, idx) => {
      // Add the difference to the last share to ensure total matches
      const amount =
        idx === value.length - 1 ? equalAmount + difference : equalAmount;
      handleAmountChange(idx, amount);
    });
  }, [totalAmount, JSON.stringify(value)]);

  return map(value, (share, idx) => (
    <View key={idx} style={styles.shareRow}>
      <Text style={{ flex: 1 }}>{getUserName(share.userId)}</Text>
      <Text>
        {share.amount
          ? `${round((share.amount / totalAmount) * 100, 2)}%`
          : "-"}
      </Text>
      <Text>{formatCurrency(share.amount, "PHP") ?? "-"}</Text>
    </View>
  ));
};

const ExactInputs = ({ users, totalAmount, value, onChange }: InputsProps) => {
  const handleAmountChange = (index: number, amount: number | string) => {
    value[index].amount = amount as number;
    value[index].isDirty = true;
    onChange(value);
  };

  // Helper to get user name by id
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.fullName || "Unknown";

  return map(value, (share, idx) => (
    <View key={idx} style={styles.shareRow}>
      <Text style={{ flex: 1 }}>{getUserName(share.userId)}</Text>
      <Text>
        {share.amount
          ? `${round((share.amount / totalAmount) * 100, 2)}%`
          : "-"}
      </Text>
      <Input
        style={{ width: 120, marginRight: 8 }}
        placeholder="Amount"
        keyboardType="numeric"
        value={share.amount?.toString() ?? ""}
        onChangeText={(val) =>
          handleAmountChange(idx, normalizeNumberInput(val))
        }
      />
    </View>
  ));
};

const PercentageInputs = ({
  users,
  totalAmount,
  value,
  onChange,
}: InputsProps) => {
  const handlePercentageChange = (
    index: number,
    percentage: string | number
  ) => {
    value[index].percentage = percentage as number;
    value[index].amount = round(totalAmount * (Number(percentage) / 100), 2);
    value[index].isDirty = true;
    onChange(value);
  };

  // Helper to get user name by id
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.fullName || "Unknown";

  return map(value, (share, idx) => (
    <View key={idx} style={styles.shareRow}>
      <Text style={{ flex: 1 }}>{getUserName(share.userId)}</Text>
      <Text>{formatCurrency(share.amount, "PHP") ?? "-"}</Text>
      <Input
        style={{ width: 120, marginRight: 8 }}
        placeholder="Percentage"
        keyboardType="numeric"
        value={share.percentage?.toString() ?? ""}
        onChangeText={(val) =>
          handlePercentageChange(idx, normalizeNumberInput(val))
        }
      />
    </View>
  ));
};

const SharesInputs = ({ users, totalAmount, value, onChange }: InputsProps) => {
  const handleSharesChange = (index: number, shareValue: string | number) => {
    value[index].shareValue = shareValue as number;
    value[index].isDirty = true;

    const totalShares = reduce(
      value,
      (curr, item) => curr + Number(item.shareValue),
      0
    );

    forEach(value, (item, i) => {
      value[i].amount = round(totalAmount * (Number(item.shareValue) / totalShares), 2);
    });

    onChange(value);
  };

  // Helper to get user name by id
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.fullName || "Unknown";

  return map(value, (share, idx) => (
    <View key={idx} style={styles.shareRow}>
      <Text style={{ flex: 1 }}>{getUserName(share.userId)}</Text>
      <Text>{formatCurrency(share.amount, "PHP") ?? "-"}</Text>
      <Input
        style={{ width: 120, marginRight: 8 }}
        placeholder="Shares"
        keyboardType="numeric"
        value={share.shareValue?.toString() ?? ""}
        onChangeText={(val) =>
          handleSharesChange(idx, normalizeNumberInput(val))
        }
      />
    </View>
  ));
};

// Component props interface
export interface IExpenseSharesFieldProps {
  label?: string;
  group: IGroup;
  splitType: ESplitType;
  totalAmount: number;
  value: TExpenseShareInput[];
  onChange: (values: TExpenseShareInput[]) => void;
}

const ExpenseSharesField: React.FC<IExpenseSharesFieldProps> = ({
  label,
  group,
  splitType,
  totalAmount,
  value,
  onChange,
}) => {
  const theme = useTheme();
  const users = useMemo(() => map(group?.members, ({ user }) => user), [group]);
  const selectedUserIds = useMemo(() => map(value, (f) => f.userId), [value]);

  // Handles changes in selected users and updates the form accordingly
  const handleUsersChange = (userIds: string[]) => {
    const existingShares = filter(value, (s) => includes(userIds, s.userId));
    const newUserIds = filter(
      userIds,
      (userId) => !includes(selectedUserIds, userId)
    );

    const updatedShares = [
      ...existingShares,
      ...map(newUserIds, (userId) => ({
        userId,
        amount: 0,
        isPayer: true,
        isDirty: false,
      })),
    ];

    onChange(updatedShares);
  };

  return (
    <View style={styles.sharesSection}>
      <Text
        category="label"
        style={{ marginBottom: 8, color: theme["text-hint-color"] }}
      >
        {label}
      </Text>
      {splitType === ESplitType.Equal && (
        <EqualInputs
          users={users}
          totalAmount={totalAmount}
          value={value}
          onChange={onChange}
        />
      )}
      {splitType === ESplitType.Exact && (
        <ExactInputs
          users={users}
          totalAmount={totalAmount}
          value={value}
          onChange={onChange}
        />
      )}
      {splitType === ESplitType.Percentage && (
        <PercentageInputs
          users={users}
          totalAmount={totalAmount}
          value={value}
          onChange={onChange}
        />
      )}
      {splitType === ESplitType.Shares && (
        <SharesInputs
          users={users}
          totalAmount={totalAmount}
          value={value}
          onChange={onChange}
        />
      )}
      <UsersSelector
        icon={value?.length ? "edit-outline" : "plus-outline"}
        buttonText={value?.length ? "Edit" : "Add"}
        users={users}
        value={selectedUserIds}
        onChange={handleUsersChange}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  sharesSection: {
    width: "100%",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
});

export default ExpenseSharesField;
