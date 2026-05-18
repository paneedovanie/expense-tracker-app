import { usersService } from "@/services";
import { IUser, IPaginatedResponse } from "@/types";
import { atom, useAtom } from "jotai";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const usersStore = atom<IUser[]>([]);
const searchStore = atom<string>();

export interface IUseUsersProps {
  id?: string;
}

export const useUsers = (props?: IUseUsersProps) => {
  const [users, setUsers] = useAtom(usersStore);
  const [search, setSearch] = useAtom(searchStore);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
    data,
  } = useInfiniteQuery({
    queryKey: ["users", search],
    queryFn: async ({ pageParam }) =>
      usersService.paginated({
        search,
        page: pageParam as number,
        orderBy: "createdAt",
        orderDir: "DESC",
      }),
    getNextPageParam: (lastPage: IPaginatedResponse<IUser>, allPages: IPaginatedResponse<IUser>[]) => {
      if ((lastPage.data?.length ?? 0) === 10) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (data?.pages) {
      const allUsers = data.pages.flatMap((page) => page.data ?? []);
      setUsers(allUsers);
    }
  }, [data, setUsers]);

  const isFetching = isFetchingPaginated;

  return {
    users,
    isFetching,
    isFetchingNextPage,
    search,
    hasNextPage,
    fetchNextPage,
    setSearch,
  };
};