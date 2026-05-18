import {
  Layout,
  Text,
  Button,
  Select,
  SelectItem,
  IndexPath,
  Input,
  Divider,
  Icon,
} from "@ui-kitten/components";
import { ScrollView, StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExpenseValidation } from "@/validations";
import {
  EDiscountType,
  EExpenseCategory,
  ESplitType,
  IExpense,
  IGroup,
  TExpenseInput,
} from "@/types";
import InputField from "@/components/forms/InputField";
import { map, pick, reduce, round, some, values } from "lodash";
import ExpenseSharesField from "@/components/forms/ExpenseSharesField";
import { useTheme } from "@ui-kitten/components";
import { getExpenseAmount, normalizeNumberInput } from "@/utils";
import { ReactNode, useEffect, useMemo } from "react";
import DiscountInput from "./DiscountInput";

export interface IExpenseFormProps {
  loading?: boolean;
  group: IGroup;
  expense?: IExpense;
  additionalAction?: ReactNode;
  onSubmit: (input: TExpenseInput) => void;
}

export default function ExpenseForm({
  loading,
  group,
  expense,
  additionalAction,
  onSubmit,
}: IExpenseFormProps) {
  const theme = useTheme();

  const users = map(group?.members, ({ user }) => user);
  const categories = values(EExpenseCategory);
  const splitTypes = values(ESplitType);

  const form = useForm<TExpenseInput>({
    resolver: zodResolver(ExpenseValidation),
    defaultValues: expense
      ? {
          ...pick(expense, [
            "description",
            "splitType",
            "discountType",
            "category",
            "amount",
            "date",
            "paidByShares",
            "paidForShares",
          ]),
          discountType: expense.discountType,
          date: new Date(expense.date),
        }
      : {
          splitType: ESplitType.Equal,
          discountType: EDiscountType.Percentage,
          category: EExpenseCategory.Food,
          date: new Date(),
          groupId: group?.id,
          paidForShares: [],
          amount: 0,
          discount: 0,
        },
  });
  const formValues = form.watch();

  const splitType = form.watch("splitType");
  const discount = Number(form.watch("discount"));
  const discountType = Number(form.watch("discountType"));
  const amount = Number(form.watch("amount"));
  const paidByShares = form.watch("paidByShares");
  const paidForShares = form.watch("paidForShares");
  const errors = form.formState.errors;

  const totalAmount = useMemo(() => getExpenseAmount(formValues), [formValues]);

  const paidBySharesTotal = useMemo(
    () => reduce(paidByShares, (acc, share) => acc + Number(share.amount), 0),
    [JSON.stringify(paidByShares)]
  );

  const paidForSharesTotal = useMemo(
    () => reduce(paidForShares, (acc, share) => acc + Number(share.amount), 0),
    [JSON.stringify(paidForShares)]
  );

  const handleSplitTypeChange = (type: ESplitType) => {
    if (type === ESplitType.Equal) {
      const equalShare = totalAmount / users.length;
      const newValues = map(users, (user) => ({
        userId: user.id,
        shareValue: 0,
        percentage: 0,
        amount: equalShare,
      }));
      form.setValue("paidForShares", newValues, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      const newValues = map(paidForShares, (item) => ({
        userId: item.userId,
        shareValue: 0,
        percentage: 0,
        amount: 0,
      }));
      form.setValue("paidForShares", newValues, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  useEffect(() => {
    if (!paidByShares?.length || totalAmount === paidBySharesTotal) {
      return;
    }

    const { dirtyTotalAmount, dirtyCount } = reduce(
      paidByShares,
      ({ dirtyTotalAmount, dirtyCount }, share) => ({
        dirtyTotalAmount:
          dirtyTotalAmount + (share.isDirty ? Number(share.amount) : 0),
        dirtyCount: dirtyCount + (share.isDirty ? 1 : 0),
      }),
      { dirtyTotalAmount: 0, dirtyCount: 0 }
    );

    const noDirtyTotalAmount = totalAmount - dirtyTotalAmount;
    const noDirtyCount = paidByShares.length - dirtyCount;

    const newValues = map(paidByShares, (item) => ({
      ...item,
      userId: item.userId,
      shareValue: 0,
      percentage: 0,
      amount: item.isDirty
        ? item.amount
        : round(noDirtyTotalAmount / (noDirtyCount || 1), 2),
    }));

    form.setValue("paidByShares", newValues);
  }, [totalAmount, discount, discountType, JSON.stringify(paidByShares)]);

  useEffect(() => {
    if (
      !paidForShares?.length ||
      totalAmount === paidForSharesTotal ||
      splitType === ESplitType.Equal ||
      splitType === ESplitType.Shares
    ) {
      return;
    }

    const { dirtyTotalAmount, dirtyCount } = reduce(
      paidForShares,
      ({ dirtyTotalAmount, dirtyCount }, share) => ({
        dirtyTotalAmount:
          dirtyTotalAmount + (share.isDirty ? Number(share.amount) : 0),
        dirtyCount: dirtyCount + (share.isDirty ? 1 : 0),
      }),
      { dirtyTotalAmount: 0, dirtyCount: 0 }
    );

    const noDirtyTotalAmount = totalAmount - dirtyTotalAmount;
    const noDirtyCount = paidForShares.length - dirtyCount;
    const noDirtyPercentage = round(
      (noDirtyTotalAmount / totalAmount) * 100,
      2
    );

    const newValues = map(paidForShares, (item) => ({
      ...item,
      userId: item.userId,
      shareValue: 0,
      percentage:
        splitType === ESplitType.Percentage
          ? item.isDirty
            ? item.percentage
            : round(noDirtyPercentage / (noDirtyCount || 1), 2)
          : 0,
      amount: item.isDirty
        ? item.amount
        : round(noDirtyTotalAmount / (noDirtyCount || 1), 2),
    }));

    form.setValue("paidForShares", newValues);
  }, [totalAmount, discount, discountType, JSON.stringify(paidForShares)]);

  useEffect(() => {
    if (!some(paidByShares, (item) => item.isDirty)) {
      return;
    }

    const newValues = map(paidByShares, (item) => ({
      ...item,
      isDirty: false,
    }));
    form.setValue("paidByShares", newValues);
  }, [paidByShares?.length]);

  useEffect(() => {
    if (!some(paidForShares, (item) => item.isDirty)) {
      return;
    }

    const newValues = map(paidForShares, (item) => ({
      ...item,
      isDirty: false,
    }));
    form.setValue("paidForShares", newValues);
  }, [paidForShares?.length]);

  return (
    <FormProvider {...form}>
      <ScrollView>
        <Layout style={styles.container}>
          <InputField
            name="description"
            label="Description *"
            placeholder="Enter description"
          />

          <InputField
            name="category"
            placeholder="Enter amount"
            render={({ field }) => (
              <Select
                label="Category *"
                style={{ width: "100%" }}
                selectedIndex={
                  new IndexPath(
                    categories.findIndex((item) => item === field.value)
                  )
                }
                value={field.value}
                onSelect={(index) => {
                  field.onChange(categories[(index as IndexPath).row]);
                }}
                caption={<Text>{errors.category?.message?.toString()}</Text>}
                status={errors.category?.message ? "danger" : "default"}
              >
                {map(categories, (item) => (
                  <SelectItem key={item} title={item} />
                ))}
              </Select>
            )}
          />

          <InputField
            name="amount"
            placeholder="Enter amount"
            render={({ field }) => (
              <Input
                {...field}
                label="Amount *"
                value={field.value?.toString() ?? ""}
                status={errors.amount?.message ? "danger" : "default"}
                onChangeText={(val) =>
                  field.onChange(normalizeNumberInput(val))
                }
                keyboardType="decimal-pad"
                caption={<Text>{errors.amount?.message?.toString()}</Text>}
              />
            )}
          />

          <DiscountInput />

          <InputField
            name="paidByShares"
            render={({ field }) => (
              <View>
                <ExpenseSharesField
                  label="Paid By *"
                  group={group}
                  splitType={ESplitType.Exact}
                  totalAmount={totalAmount}
                  value={field.value}
                  onChange={field.onChange}
                />
                <Text
                  style={{ fontSize: 12, color: theme["color-danger-500"] }}
                >
                  {errors.paidByShares?.message?.toString()}
                </Text>
              </View>
            )}
          />

          <InputField
            name="splitType"
            placeholder="Enter split type"
            render={({ field }) => (
              <Select
                label="Split type *"
                style={{ width: "100%" }}
                selectedIndex={
                  new IndexPath(
                    splitTypes.findIndex((item) => item === field.value)
                  )
                }
                value={field.value}
                onSelect={(index) => {
                  const splitType = splitTypes[(index as IndexPath).row];
                  field.onChange(splitType);
                  handleSplitTypeChange(splitType);
                }}
                caption={<Text>{errors.splitType?.message?.toString()}</Text>}
                status={errors.splitType?.message ? "danger" : "default"}
              >
                {map(splitTypes, (item) => (
                  <SelectItem key={item} title={item} />
                ))}
              </Select>
            )}
          />

          <InputField
            name="paidForShares"
            render={({ field }) => (
              <View>
                <ExpenseSharesField
                  label="Paid For *"
                  group={group}
                  splitType={splitType}
                  totalAmount={totalAmount}
                  value={field.value}
                  onChange={field.onChange}
                />

                <Text
                  style={{ fontSize: 12, color: theme["color-danger-500"] }}
                >
                  {errors.paidForShares?.message?.toString()}
                </Text>
              </View>
            )}
          />
          <View style={{ gap: 16 }}>
            <Button
              style={styles.saveButton}
              onPress={form.handleSubmit(onSubmit)}
              disabled={loading || !form.formState.isDirty}
            >
              {expense ? "Update Expense" : "Create Expense"}
            </Button>
            {additionalAction && (
              <>
                <Divider />
                {additionalAction}
              </>
            )}
          </View>
        </Layout>
      </ScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  saveButton: {
    marginTop: 24,
    width: "100%",
  },
});
