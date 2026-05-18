import { paymentsService } from "@/services";
import {
  IPayment,
  IPaginatedResponse,
  TCreatePaymentInput,
  TUpdatePaymentInput,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";

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
    data,
  } = useInfiniteQuery({
    queryKey: ["payments", expenseId],
    queryFn: async ({ pageParam }) =>
      paymentsService.paginated({
        expenseId,
        groupId,
        page: pageParam as number,
        orderBy: "createdAt",
        orderDir: "DESC",
      }),
    getNextPageParam: (lastPage: IPaginatedResponse<IPayment>, allPages: IPaginatedResponse<IPayment>[]) => {
      if ((lastPage.data?.length ?? 0) === 10) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (data?.pages) {
      const allPayments = data.pages.flatMap((page) => page.data ?? []);
      setPayments(allPayments);
    }
  }, [data, setPayments]);

  const { data: payment, isFetching: isFetchingPayment } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentsService.get(id!),
    enabled: !!id,
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (input: TCreatePaymentInput) => paymentsService.create(input),
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (input: TUpdatePaymentInput) => paymentsService.update(id!, input),
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: () => paymentsService.delete(id!),
  });

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