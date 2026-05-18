import { groupsService } from "@/services";
import {
  IGroup,
  IPaginatedResponse,
  TAddGroupMembersInput,
  TCreateGroupInput,
  TRemoveGroupMembersInput,
  TUpdateGroupInput,
} from "@/types";
import { useMutation, useQuery } from "react-query";
import { atom, useAtom } from "jotai";
import { useInfiniteQuery } from "react-query";
import { useMemo } from "react";

const groupsStore = atom<IGroup[]>([]);
const groupStore = atom<IGroup>();

export interface IUseGroupsProps {
  id?: string;
}

export const useGroups = (props?: IUseGroupsProps) => {
  const { id } = props ?? {};

  const [groups, setGroups] = useAtom(groupsStore);
  const [group, setGroup] = useAtom(groupStore);
  const members = group?.members ?? [];

  const usersMapper: Record<string, string> = useMemo(() => {
    return members.reduce((acc, member) => {
      return {
        ...acc,
        [member.user.id]: member.user,
      };
    }, {});
  }, []);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
  } = useInfiniteQuery<IPaginatedResponse<IGroup>, Error>(
    ["groups"],
    ({ pageParam = 1 }) =>
      groupsService.paginated({
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
        const allGroups = result.pages.flatMap((page) => page.data);
        setGroups(allGroups);
      },
    }
  );

  const { isFetching: isFetchingGroup, refetch } = useQuery<IGroup, Error>(
    ["group", id],
    () => groupsService.get(id!),
    {
      enabled: !!id,
      onSuccess: setGroup,
      cacheTime: 0,
    }
  );

  const { mutate: create, isLoading: isCreating } = useMutation<
    IGroup,
    Error,
    TCreateGroupInput
  >((input: TCreateGroupInput) => groupsService.create(input));

  const { mutate: update, isLoading: isUpdating } = useMutation<
    IGroup,
    Error,
    TUpdateGroupInput
  >((input: TUpdateGroupInput) => groupsService.update(id!, input));

  const { mutate: remove, isLoading: isRemoving } = useMutation<IGroup, Error>(
    () => groupsService.delete(id!)
  );

  const { mutate: addMembers, isLoading: isAddingMembers } = useMutation<
    void,
    Error,
    TAddGroupMembersInput
  >((input: TAddGroupMembersInput) => groupsService.addMembers(id!, input));

  const { mutate: removeMembers, isLoading: isRemovingMembers } = useMutation<
    void,
    Error,
    TRemoveGroupMembersInput
  >((input: TRemoveGroupMembersInput) =>
    groupsService.removeMembers(id!, input)
  );

  const isFetching = isFetchingPaginated || isFetchingGroup;
  const isLoading =
    isCreating ||
    isUpdating ||
    isAddingMembers ||
    isRemovingMembers ||
    isRemoving;

  return {
    group,
    groups,
    usersMapper,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    create,
    update,
    remove,
    fetchNextPage,
    addMembers,
    removeMembers,
    refetch,
  };
};
