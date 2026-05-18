import { expensesService } from "@/services";
import {
  IExpense,
  IPaginatedResponse,
  TCreateExpenseInput,
  TSettleUpInput,
  TUpdateExpenseInput,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { atom, useAtom } from "jotai";

const expenseStore = atom<IExpense>();

export interface IUseExpensesProps {
  id?: string;
  groupId?: string;
}

export const useExpenses = (props?: IUseExpensesProps) => {
  const { id, groupId } = props ?? {};
  const queryClient = useQueryClient();

  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [expense, setExpense] = useAtom(expenseStore);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
    refetch: refetchMany,
    data,
  } = useInfiniteQuery({
    queryKey: ["expenses", groupId],
    queryFn: async ({ pageParam }) =>
      expensesService.paginated({
        groupId,
        page: pageParam as number,
        orderBy: "createdAt",
        orderDir: "DESC",
      }),
    getNextPageParam: (lastPage: IPaginatedResponse<IExpense>, allPages: IPaginatedResponse<IExpense>[]) => {
      if ((lastPage.data?.length ?? 0) === 10) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (data?.pages) {
      const allExpenses = data.pages.flatMap((page) => page.data ?? []);
      setExpenses(allExpenses);
    }
  }, [data]);

  const { isFetching: isFetchingExpense, refetch: refetchOne } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => expensesService.get(id!),
    enabled: !!id,
    staleTime: 0,
    select: (data) => {
      setExpense(data);
      return data;
    },
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (input: TCreateExpenseInput) => expensesService.create(input),
    onSuccess: (expense) => {
      setExpense(expense);
      queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (input: TUpdateExpenseInput) => expensesService.update(id!, input),
    onSuccess: setExpense,
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: () => expensesService.delete(id!),
  });

  const { mutate: setteUp, isPending: isSettlingUp } = useMutation({
    mutationFn: (input: TSettleUpInput) => expensesService.setteUp(id!, input),
  });

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