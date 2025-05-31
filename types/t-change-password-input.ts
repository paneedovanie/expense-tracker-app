import { ChangePasswordValidation } from "@/validations";
import { z } from "zod";

export type TChangePasswordInput = z.infer<typeof ChangePasswordValidation>;
