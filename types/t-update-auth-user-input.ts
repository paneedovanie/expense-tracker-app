import { UpdateAuthUserValidation } from "@/validations";
import { z } from "zod";

export type TUpdateAuthUserInput = z.infer<typeof UpdateAuthUserValidation>;
