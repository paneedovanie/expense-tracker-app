import { useExpenses, useGroups } from "@/hooks";
import { Spinner } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "@/components/providers/ToastProvider";
import { useQueryClient } from "react-query";
import ExpenseForm from "@/components/forms/ExpenseForm";

export default function AddExpenseScreen() {
  const searchParams = useLocalSearchParams();
  const groupId = searchParams.groupId as string;
  const queryClient = useQueryClient();
  const toast = useToast();

  const { group } = useGroups({ id: groupId });
  const { create, isLoading } = useExpenses();

  if (!group) {
    return <Spinner />;
  }

  return (
    <ExpenseForm
      group={group}
      loading={isLoading}
      onSubmit={(input) =>
        create(input, {
          onSuccess: async (expense) => {
            await queryClient.refetchQueries(["expenses", groupId]);
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
        })
      }
    />
  );
}
