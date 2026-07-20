'use client';
import { useExpenses, useGroups } from "@/hooks";
import { Spinner } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "@/components/providers/ToastProvider";
import ExpenseForm from "@/components/forms/ExpenseForm";
import { IOcrResultData } from "@/types";

export default function AddExpenseScreen() {
  const searchParams = useLocalSearchParams();
  const groupId = searchParams.groupId as string;
  const ocrDataStr = searchParams.ocrData as string | undefined;
  const toast = useToast();

  const { group } = useGroups({ id: groupId });
  const { create, isLoading } = useExpenses({ groupId });

  const initialData: IOcrResultData | undefined = ocrDataStr
    ? JSON.parse(decodeURIComponent(ocrDataStr))
    : undefined;

  if (!group) {
    return <Spinner />;
  }

  return (
    <ExpenseForm
      group={group}
      loading={isLoading}
      initialData={initialData}
      onSubmit={async (input) => {
        create(input, {
          onSuccess: (expense) => {
            router.replace({
              pathname: "/(app)/(groups)/(expenses)/view",
              params: {
                groupId,
                expenseId: expense.id,
              },
            });
            toast.showToast({
              status: "success",
              message: `Expense created successfully`,
            });
          },
        });
      }}
    />
  );
}
