import { usersService } from "@/services";
import { IUser, IPaginatedResponse } from "@/types";
import { atom, useAtom } from "jotai";
import { useInfiniteQuery } from "react-query";

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
  } = useInfiniteQuery<IPaginatedResponse<IUser>, Error>(
    ["users", search],
    ({ pageParam = 1 }) =>
      usersService.paginated({
        search,
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
        const allUsers = result.pages.flatMap((page) => page.data);
        setUsers(allUsers);
      },
    }
  );

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
