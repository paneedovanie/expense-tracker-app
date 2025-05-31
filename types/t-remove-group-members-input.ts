import { RemoveGroupMembersValidation } from "@/validations";
import { z } from "zod";

export type TRemoveGroupMembersInput = z.infer<
  typeof RemoveGroupMembersValidation
>;
