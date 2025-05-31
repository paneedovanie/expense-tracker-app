import { AddGroupMembersValidation } from "@/validations";
import { z } from "zod";

export type TAddGroupMembersInput = z.infer<typeof AddGroupMembersValidation>;
