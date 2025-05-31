import { z } from "zod";

export const RemoveGroupMembersValidation = z.object({
  userIds: z.string().uuid().array(),
});
