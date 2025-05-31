import { expensesService } from "@/services";
import {
  IExpense,
  IPaginatedResponse,
  TCreateExpenseInput,
  TUpdateExpenseInput,
} from "@/types";
import { useMutation, useQuery } from "react-query";
import { atom, useAtom } from "jotai";
import { useInfiniteQuery } from "react-query";

const expensesStore = atom<IExpense[]>([]);

export interface IUseExpensesProps {
  id?: string;
}

export const useExpenses = (props?: IUseExpensesProps) => {
  const { id } = props ?? {};

  const [expenses, setExpenses] = useAtom(expensesStore);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
  } = useInfiniteQuery<IPaginatedResponse<IExpense>, Error>(
    ["expenses"],
    ({ pageParam = 1 }) =>
      expensesService.paginated({
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
    }
  );

  const { data: expense, isFetching: isFetchingExpense } = useQuery<
    IExpense,
    Error
  >(["expense", id], () => expensesService.get(id!), { enabled: !!id });

  const { mutate: create, isLoading: isCreating } = useMutation<
    IExpense,
    Error,
    TCreateExpenseInput
  >((input: TCreateExpenseInput) => expensesService.create(input));

  const { mutate: update, isLoading: isUpdating } = useMutation<
    IExpense,
    Error,
    TUpdateExpenseInput
  >((input: TUpdateExpenseInput) => expensesService.update(id!, input));

  const isFetching = isFetchingPaginated || isFetchingExpense;
  const isLoading = isCreating || isUpdating;

  return {
    expense,
    expenses,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    create,
    update,
    fetchNextPage,
  };
};
