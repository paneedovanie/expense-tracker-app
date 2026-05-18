import { expensesService } from "@/services";
import {
  IExpense,
  IPaginatedResponse,
  TCreateExpenseInput,
  TSettleUpInput,
  TUpdateExpenseInput,
} from "@/types";
import { useMutation, useQuery } from "react-query";
import { useInfiniteQuery } from "react-query";
import { useState } from "react";
import { atom, useAtom } from "jotai";

const expenseStore = atom<IExpense>();

export interface IUseExpensesProps {
  id?: string;
  groupId?: string;
}

export const useExpenses = (props?: IUseExpensesProps) => {
  const { id, groupId } = props ?? {};

  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [expense, setExpense] = useAtom(expenseStore);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
    refetch: refetchMany,
  } = useInfiniteQuery<IPaginatedResponse<IExpense>, Error>(
    ["expenses", groupId],
    ({ pageParam = 1 }) =>
      expensesService.paginated({
        groupId,
        page: pageParam,
        orderBy: "createdAt",
        orderDir: "DESC",
      }),
    {
      getNextPageParam: (lastPage, allPages) => {
        // Assuming 10 items per page, if less than 10, no more pages
        if ((lastPage.data?.length ?? 0) === 10) {
          return allPages.length + 1;
        }
        return undefined;
      },
      onSuccess: (result) => {
        // Flatten all pages' data into a single array
        const allExpenses = result.pages.flatMap((page) => page.data);
        setExpenses(allExpenses);
      },
      cacheTime: 0,
      staleTime: 0,
    }
  );

  const { isFetching: isFetchingExpense, refetch: refetchOne } = useQuery<
    IExpense,
    Error
  >(["expense", id], () => expensesService.get(id!), {
    onSuccess: setExpense,
    enabled: !!id,
    cacheTime: 0,
    staleTime: 0,
  });

  const { mutate: create, isLoading: isCreating } = useMutation<
    IExpense,
    Error,
    TCreateExpenseInput
  >((input: TCreateExpenseInput) => expensesService.create(input));

  const { mutate: update, isLoading: isUpdating } = useMutation<
    IExpense,
    Error,
    TUpdateExpenseInput
  >((input: TUpdateExpenseInput) => expensesService.update(id!, input), {
    onSuccess: setExpense,
  });

  const { mutate: remove, isLoading: isRemoving } = useMutation<
    IExpense,
    Error
  >(() => expensesService.delete(id!));

  const { mutate: setteUp, isLoading: isSettlingUp } = useMutation<
    void,
    Error,
    TSettleUpInput
  >((input: TSettleUpInput) => expensesService.setteUp(id!, input));

  const isFetching = isFetchingPaginated || isFetchingExpense;
  const isLoading = isCreating || isUpdating || isRemoving || isSettlingUp;

  return {
    expense,
    expenses,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    create,
    update,
    remove,
    fetchNextPage,
    setteUp,
    refetchOne,
    refetchMany,
  };
};
