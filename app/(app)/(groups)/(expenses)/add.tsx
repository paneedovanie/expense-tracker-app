'use client';
import { useExpenses, useGroups } from "@/hooks";
import { Spinner } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "@/components/providers/ToastProvider";
import ExpenseForm from "@/components/forms/ExpenseForm";

export default function AddExpenseScreen() {
  const searchParams = useLocalSearchParams();
  const groupId = searchParams.groupId as string;
  const toast = useToast();

  const { group } = useGroups({ id: groupId });
  const { create, isLoading } = useExpenses({ groupId });

  if (!group) {
    return <Spinner />;
  }

  return (
    <ExpenseForm
      group={group}
      loading={isLoading}
      onSubmit={async (input) => {
        await create(input);
        router.replace({
          pathname: "/(app)/(groups)/(expenses)/view",
          params: {
            groupId,
          },
        });
        toast.showToast({
          status: "success",
          message: `Expense created successfully`,
        });
      }}
    />
  );
}
