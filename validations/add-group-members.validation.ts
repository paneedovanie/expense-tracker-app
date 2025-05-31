import { z } from "zod";

export const AddGroupMembersValidation = z.object({
  userIds: z.string().uuid().array(),
});
