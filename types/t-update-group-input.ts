import { UpdateGroupValidation } from "@/validations";
import { z } from "zod";

export type TUpdateGroupInput = z.infer<typeof UpdateGroupValidation>;
