import { useExpenses, useGroups } from "@/hooks";
import {
  Layout,
  Text,
  Button,
  Select,
  SelectItem,
  IndexPath,
} from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExpenseValidation } from "@/validations";
import { EExpenseCategory, ESplitType, TCreateExpenseInput } from "@/types";
import InputField from "@/components/forms/InputField";
import { useToast } from "@/components/providers/ToastProvider";
import { useQueryClient } from "react-query";
import { map, values } from "lodash";
import ExpenseSharesField from "@/components/forms/ExpenseSharesField";

export default function AddExpenseScreen() {
  const searchParams = useLocalSearchParams();
  const groupId = searchParams.groupId as string;
  const queryClient = useQueryClient();
  const { create, isLoading } = useExpenses();
  const toast = useToast();

  const { group } = useGroups({ id: groupId });

  const users = map(group?.members, ({ user }) => user);
  const categories = values(EExpenseCategory);
  const splitTypes = values(ESplitType);

  const form = useForm<TCreateExpenseInput>({
    resolver: zodResolver(CreateExpenseValidation),
    defaultValues: {
      splitType: ESplitType.Equal,
      category: EExpenseCategory.Food,
      date: new Date(),
      groupId,
      shares: users.map((user) => ({
        userId: user.id,
        amount: 0,
        isPayer: false,
      })),
    },
  });

  const errors = form.formState.errors;

  const submit = (input: TCreateExpenseInput) => {
    create(input, {
      async onSuccess(expense) {
        queryClient.refetchQueries(["expenses"]);
        router.back();
        toast.showToast({
          status: "success",
          message: `Expense created successfully`,
        });
      },
    });
  };

  // Helper to get user name by id
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.fullName || "Unknown";

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <InputField
          name="description"
          label="Description *"
          placeholder="Enter description"
        />

        <InputField name="amount" label="Amount *" placeholder="Enter amount" />

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
                field.onChange(splitTypes[(index as IndexPath).row]);
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

        {/* Shares Section */}
        <ExpenseSharesField groupId={groupId} />

        <Button
          style={styles.saveButton}
          onPress={form.handleSubmit(submit)}
          disabled={isLoading || !form.formState.isDirty}
        >
          Add
        </Button>
      </Layout>
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
