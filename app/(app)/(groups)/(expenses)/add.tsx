import Avatar from "@/components/avatar/Avatar";
import { useExpenses, useGroups } from "@/hooks";
import {
  Layout,
  Text,
  Button,
  Select,
  SelectItem,
  IndexPath,
  EvaProp,
} from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExpenseValidation } from "@/validations";
import { EExpenseCategory, ESplitType, TCreateExpenseInput } from "@/types";
import InputField from "@/components/forms/InputField";
import { useToast } from "@/components/providers/ToastProvider";
import { useQueryClient } from "react-query";
import { map, values } from "lodash";
import { useState } from "react";

export default function AddExpenseScreen() {
  const searchParams = useLocalSearchParams();
  const groupId = searchParams.groupId as string;
  const queryClient = useQueryClient();
  const { create, isLoading } = useExpenses();
  const toast = useToast();
  const [selectedCategoryIndex, setSelectedCategoryIndex] =
    useState<IndexPath>();
  const [selectedUserIndex, setSelectedUserIndex] = useState<IndexPath>();
  const [selectedSplitTypeIndex, setSelectedSplitTypeIndex] =
    useState<IndexPath>();

  const { group } = useGroups({ id: groupId });

  const users = map(group?.members, ({ user }) => user);
  const categories = values(EExpenseCategory);
  const splitTypes = values(ESplitType);

  const form = useForm<TCreateExpenseInput>({
    resolver: zodResolver(CreateExpenseValidation),
    defaultValues: {
      date: new Date(),
      groupId,
    },
  });
  const formValues = form.watch();

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
              selectedIndex={selectedCategoryIndex}
              onSelect={(index) => {
                setSelectedCategoryIndex(index as IndexPath);
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
              selectedIndex={selectedSplitTypeIndex}
              onSelect={(index) => {
                setSelectedSplitTypeIndex(index as IndexPath);
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

        <InputField
          name="paidByUserId"
          placeholder="Paid by"
          render={({ field }) => (
            <Select
              {...field}
              label="Paid by *"
              style={{ width: "100%" }}
              selectedIndex={selectedUserIndex}
              value={
                selectedUserIndex && users[selectedUserIndex.row]?.firstName
              }
              onSelect={(index) => {
                setSelectedUserIndex(index as IndexPath);
                field.onChange(users[(index as IndexPath).row].id);
              }}
              caption={<Text>{errors.paidByUserId}</Text>}
            >
              {map(users, (item) => (
                <SelectItem key={item.id} title={item.firstName} />
              ))}
            </Select>
          )}
        />

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
  header: {
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    marginTop: 12,
  },
  saveButton: {
    marginTop: 24,
    width: "100%",
  },
});
