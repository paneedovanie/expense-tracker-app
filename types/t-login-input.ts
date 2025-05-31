import { LoginValidation } from "@/validations";
import { z } from "zod";

export type TLoginInput = z.infer<typeof LoginValidation>;
