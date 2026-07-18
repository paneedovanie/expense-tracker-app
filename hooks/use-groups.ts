import { groupsService } from "@/services";
import {
  IGroup,
  IPaginatedResponse,
  TAddGroupMembersInput,
  TCreateGroupInput,
  TRemoveGroupMembersInput,
  TUpdateGroupInput,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useEffect } from "react";
import { atom, useAtom } from "jotai";

const groupsStore = atom<IGroup[]>([]);
const groupStore = atom<IGroup>();

export interface IUseGroupsProps {
  id?: string;
}

export const useGroups = (props?: IUseGroupsProps) => {
  const { id } = props ?? {};
  const queryClient = useQueryClient();

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
  }, [members]);

  const {
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingPaginated,
    isFetchingNextPage,
    data,
  } = useInfiniteQuery({
    queryKey: ["groups"],
    queryFn: async ({ pageParam }) =>
      groupsService.paginated({
        page: pageParam as number,
        orderBy: "createdAt",
        orderDir: "DESC",
      }),
    getNextPageParam: (lastPage: IPaginatedResponse<IGroup>, allPages: IPaginatedResponse<IGroup>[]) => {
      if ((lastPage.data?.length ?? 0) === 10) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (data?.pages) {
      const allGroups = data.pages.flatMap((page) => page.data ?? []);
      setGroups(allGroups);
    }
  }, [data, setGroups]);

  const { isFetching: isFetchingGroup, refetch, data: groupData } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groupsService.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (groupData) {
      setGroup(groupData);
    }
  }, [groupData, setGroup]);

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (input: TCreateGroupInput) => groupsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (input: TUpdateGroupInput) => groupsService.update(id!, input),
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: () => groupsService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const { mutate: addMembers, isPending: isAddingMembers } = useMutation({
    mutationFn: (input: TAddGroupMembersInput) => groupsService.addMembers(id!, input),
  });

  const { mutate: removeMembers, isPending: isRemovingMembers } = useMutation({
    mutationFn: (input: TRemoveGroupMembersInput) =>
      groupsService.removeMembers(id!, input),
  });

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