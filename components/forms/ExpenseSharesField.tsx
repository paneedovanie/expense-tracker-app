import { useGroups } from "@/hooks";
import {
  Text,
  Button,
  Select,
  SelectItem,
  IndexPath,
  Icon,
  Input,
  CheckBox,
} from "@ui-kitten/components";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ESplitType, TCreateExpenseInput } from "@/types";
import { filter, map } from "lodash";
import { useEffect } from "react";
import InputField from "./InputField";

export interface IExpenseSharesFieldProps {
  groupId: string;
}

export default function ExpenseSharesField({
  groupId,
}: IExpenseSharesFieldProps) {
  const form = useFormContext<TCreateExpenseInput>();

  const errors = form.formState.errors;

  const { group } = useGroups({ id: groupId });

  const users = map(group?.members, ({ user }) => user);

  // Shares field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shares",
  });

  const shares = form.watch("shares");

  const splitType = form.watch("splitType");
  const totalAmount = Number(form.watch("amount")) || 0;

  // Auto-compute shares for "Equal" split type
  useEffect(() => {
    const borrowers = filter(shares, ({ isPayer }) => !isPayer);

    if (
      splitType === ESplitType.Equal &&
      borrowers.length > 0 &&
      totalAmount > 0
    ) {
      const equalAmount = Number((totalAmount / borrowers.length).toFixed(2));

      shares.forEach((field, idx) => {
        if (field.isPayer) return;
        form.setValue(`shares.${idx}.amount`, equalAmount, {
          shouldValidate: true,
        });
      });
    }
    // Optionally, handle other split types here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitType, totalAmount, JSON.stringify(shares)]);

  // Helper to get user name by id
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.fullName || "Unknown";

  return (
    <View style={styles.sharesSection}>
      <Text category="label" style={{ marginBottom: 8 }}>
        Shares *
      </Text>
      {fields.map((field, idx) => (
        <View key={field.id} style={styles.shareRow}>
          <Controller
            control={form.control}
            name={`shares.${idx}.userId`}
            render={({ field: userField }) => (
              <Select
                style={{ flex: 1, marginRight: 8 }}
                value={getUserName(userField.value)}
                selectedIndex={
                  new IndexPath(
                    users.findIndex((u) => u.id === userField.value)
                  )
                }
                onSelect={(index) => {
                  const userId = users[(index as IndexPath).row].id;
                  // Prevent duplicate userId in shares
                  const isDuplicate = form
                    .getValues("shares")
                    .some((share, i) => share.userId === userId && i !== idx);
                  if (!isDuplicate) {
                    userField.onChange(userId);
                  } else {
                    // Optionally show a warning/toast here
                  }
                }}
              >
                {users.map((user) => (
                  <SelectItem
                    key={user.id}
                    title={user.fullName}
                    disabled={
                      // Disable if userId is already selected in another share
                      form
                        .getValues("shares")
                        .some(
                          (share, i) => share.userId === user.id && i !== idx
                        )
                    }
                  />
                ))}
              </Select>
            )}
          />
          <Controller
            control={form.control}
            name={`shares.${idx}.amount`}
            render={({ field: amountField }) => (
              <Input
                style={{ width: 90, marginRight: 8 }}
                placeholder="Amount"
                keyboardType="numeric"
                value={amountField.value?.toString() ?? ""}
                onChangeText={(val) => amountField.onChange(Number(val))}
                status={errors.shares?.[idx]?.amount ? "danger" : "default"}
              />
            )}
          />
          <InputField
            name={`shares.${idx}.isPayer`}
            noCaption
            render={({ field: payerField }) => (
              <CheckBox
                checked={!!payerField.value}
                onChange={payerField.onChange}
                style={{ marginRight: 8 }}
              >
                Payer
              </CheckBox>
            )}
          />
          <TouchableOpacity
            onPress={() => remove(idx)}
            disabled={fields.length <= 2}
            style={{ opacity: fields.length <= 2 ? 0.5 : 1 }}
          >
            <Icon
              name="trash-2-outline"
              fill="#FF3D71"
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>
      ))}
      {users.length !== fields.length && (
        <Button
          appearance="ghost"
          size="small"
          onPress={() =>
            append({
              userId: users[0]?.id,
              amount: 0,
              isPayer: false,
            })
          }
          style={{ marginTop: 8 }}
          accessoryLeft={
            <Icon
              name="plus-outline"
              fill="#3366FF"
              style={{ width: 20, height: 20 }}
            />
          }
        >
          Add Share
        </Button>
      )}
      <Text status="danger" appearance="hint" style={{ marginTop: 4 }}>
        {errors.shares?.root?.message?.toString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sharesSection: {
    marginTop: 24,
    marginBottom: 8,
    width: "100%",
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
});
