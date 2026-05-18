import { paymentsService } from "@/services";
import {
  IPayment,
  IPaginatedResponse,
  TCreatePaymentInput,
  TUpdatePaymentInput,
} from "@/types";
import { useMutation, useQuery } from "react-query";
import { atom, useAtom } from "jotai";
import { useInfiniteQuery } from "react-query";

const paymentsStore = atom<IPayment[]>([]);

export interface IUsePaymentsProps {
  id?: string;
  groupId?: string;
  expenseId?: string;
}

export const usePayments = (props?: IUsePaymentsProps) => {
  const { id, groupId, expenseId } = props ?? {};

  const [payments, setPayments] = useAtom(paymentsStore);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
  } = useInfiniteQuery<IPaginatedResponse<IPayment>, Error>(
    ["payments", expenseId],
    ({ pageParam = 1 }) =>
      paymentsService.paginated({
        expenseId,
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
        const allPayments = result.pages.flatMap((page) => page.data);
        setPayments(allPayments);
      },
    }
  );

  const { data: payment, isFetching: isFetchingPayment } = useQuery<
    IPayment,
    Error
  >(["payment", id], () => paymentsService.get(id!), { enabled: !!id });

  const { mutate: create, isLoading: isCreating } = useMutation<
    IPayment,
    Error,
    TCreatePaymentInput
  >((input: TCreatePaymentInput) => paymentsService.create(input));

  const { mutate: update, isLoading: isUpdating } = useMutation<
    IPayment,
    Error,
    TUpdatePaymentInput
  >((input: TUpdatePaymentInput) => paymentsService.update(id!, input));

  const { mutate: remove, isLoading: isRemoving } = useMutation<
    IPayment,
    Error
  >(() => paymentsService.delete(id!));

  const isFetching = isFetchingPaginated || isFetchingPayment;
  const isLoading = isCreating || isUpdating || isRemoving;

  return {
    payment,
    payments,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    create,
    update,
    remove,
    fetchNextPage,
  };
};
