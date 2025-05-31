import { CreateGroupValidation } from "@/validations";
import { z } from "zod";

export type TCreateGroupInput = z.infer<typeof CreateGroupValidation>;
